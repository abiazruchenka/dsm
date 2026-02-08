package de.dsm.backend.services;

import de.dsm.backend.models.dto.BlockDetailResponse;
import de.dsm.backend.models.dto.BlockListResponse;
import de.dsm.backend.models.dto.BlockRequest;
import de.dsm.backend.models.dto.BlockResponse;
import de.dsm.backend.models.dto.BlocksByCategoryResponse;
import de.dsm.backend.models.dto.CategoryCreateRequest;
import de.dsm.backend.models.dto.CategoryResponse;
import de.dsm.backend.models.dto.PhotoResponse;
import de.dsm.backend.models.entity.Block;
import de.dsm.backend.models.entity.ReenactmentCategory;
import de.dsm.backend.repositories.BlockRepository;
import de.dsm.backend.repositories.ReenactmentCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReenactmentService {

    private final BlockRepository blockRepository;
    private final ReenactmentCategoryRepository categoryRepository;
    private final PhotoService photoService;
    private final S3UrlService s3UrlService;

    public List<BlocksByCategoryResponse> getBlocksGroupedByCategory() {
        List<ReenactmentCategory> categories = categoryRepository.findAllByOrderBySortOrderAsc();
        List<Block> allBlocks = blockRepository.findAllByOrderBySortOrderAsc();

        Map<UUID, List<Block>> blocksByCategory = allBlocks.stream()
                .collect(Collectors.groupingBy(b -> b.getCategoryId() != null ? b.getCategoryId() : UUID.fromString("00000000-0000-0000-0000-000000000000")));

        List<BlocksByCategoryResponse> result = new ArrayList<>();

        for (ReenactmentCategory cat : categories) {
            List<Block> blocks = blocksByCategory.getOrDefault(cat.getId(), List.of());
            result.add(new BlocksByCategoryResponse(
                    cat.getId(),
                    cat.getCode(),
                    Map.of("de", cat.getNameDe(), "en", cat.getNameEn(), "fr", cat.getNameFr()),
                    cat.getSortOrder(),
                    blocks.stream().map(this::toBlockListResponse).toList()
            ));
        }

        List<Block> uncategorized = blocksByCategory.getOrDefault(UUID.fromString("00000000-0000-0000-0000-000000000000"), List.of());
        if (!uncategorized.isEmpty()) {
            result.add(new BlocksByCategoryResponse(
                    null,
                    "other",
                    Map.of("de", "Sonstige", "en", "Other", "fr", "Autre"),
                    999,
                    uncategorized.stream().map(this::toBlockListResponse).toList()
            ));
        }

        return result;
    }

    public List<CategoryResponse> getCategories() {
        return categoryRepository.findAllByOrderBySortOrderAsc().stream()
                .map(c -> new CategoryResponse(
                        c.getId(),
                        c.getCode(),
                        Map.of("de", c.getNameDe(), "en", c.getNameEn(), "fr", c.getNameFr()),
                        c.getSortOrder()))
                .toList();
    }

    public CategoryResponse createCategory(CategoryCreateRequest request) {
        if (categoryRepository.findByCode(request.code()).isPresent()) {
            throw new IllegalArgumentException("Category with code " + request.code() + " already exists");
        }
        ReenactmentCategory cat = new ReenactmentCategory();
        cat.setCode(request.code().trim().toLowerCase().replaceAll("\\s+", "_"));
        cat.setNameDe(request.nameDe());
        cat.setNameEn(request.nameEn());
        cat.setNameFr(request.nameFr());
        cat.setSortOrder(request.sortOrder() != null ? request.sortOrder() : 0);
        cat = categoryRepository.save(cat);
        return new CategoryResponse(
                cat.getId(),
                cat.getCode(),
                Map.of("de", cat.getNameDe(), "en", cat.getNameEn(), "fr", cat.getNameFr()),
                cat.getSortOrder());
    }

    public CategoryResponse updateCategory(UUID id, CategoryCreateRequest request) {
        ReenactmentCategory cat = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        if (request.nameDe() != null) cat.setNameDe(request.nameDe());
        if (request.nameEn() != null) cat.setNameEn(request.nameEn());
        if (request.nameFr() != null) cat.setNameFr(request.nameFr());
        if (request.sortOrder() != null) cat.setSortOrder(request.sortOrder());
        cat = categoryRepository.save(cat);
        return new CategoryResponse(
                cat.getId(),
                cat.getCode(),
                Map.of("de", cat.getNameDe(), "en", cat.getNameEn(), "fr", cat.getNameFr()),
                cat.getSortOrder());
    }

    public void deleteCategory(UUID id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found");
        }
        categoryRepository.deleteById(id);
    }

    public BlockDetailResponse getBlockById(UUID id) {
        Block block = blockRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Block not found"));
        List<PhotoResponse> photos = photoService.getPhotos(id);
        ReenactmentCategory cat = block.getCategoryId() != null
                ? categoryRepository.findById(block.getCategoryId()).orElse(null)
                : null;
        return new BlockDetailResponse(
                block.getId(),
                block.getTitle(),
                block.getText(),
                s3UrlService.getPublicUrl(block.getImage()),
                block.getCategoryId(),
                cat != null ? cat.getCode() : null,
                block.getSortOrder(),
                photos
        );
    }

    public BlockResponse createBlock(BlockRequest request) {
        Block block = new Block();
        block.setTitle(request.title());
        block.setText(request.text());
        block.setCategoryId(request.categoryId());
        block.setSortOrder(request.sortOrder() != null ? request.sortOrder() : 0);
        block = blockRepository.save(block);
        return toBlockResponse(block);
    }

    public BlockResponse updateBlock(UUID id, BlockRequest request) {
        Block block = blockRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Block not found"));
        if (request.title() != null) block.setTitle(request.title());
        if (request.text() != null) block.setText(request.text());
        if (request.categoryId() != null) block.setCategoryId(request.categoryId());
        if (request.sortOrder() != null) block.setSortOrder(request.sortOrder());
        if (request.image() != null) block.setImage(request.image());
        block = blockRepository.save(block);
        return toBlockResponse(block);
    }

    public void deleteBlock(UUID id) {
        if (!blockRepository.existsById(id)) {
            throw new RuntimeException("Block not found");
        }
        photoService.deletePhotosByGalleryId(id);
        blockRepository.deleteById(id);
    }

    private BlockListResponse toBlockListResponse(Block b) {
        ReenactmentCategory cat = b.getCategoryId() != null
                ? categoryRepository.findById(b.getCategoryId()).orElse(null)
                : null;
        return new BlockListResponse(
                b.getId(),
                b.getTitle(),
                s3UrlService.getPublicUrl(b.getImage()),
                b.getCategoryId(),
                cat != null ? cat.getCode() : null,
                b.getSortOrder()
        );
    }

    private BlockResponse toBlockResponse(Block b) {
        ReenactmentCategory cat = b.getCategoryId() != null
                ? categoryRepository.findById(b.getCategoryId()).orElse(null)
                : null;
        return new BlockResponse(
                b.getId(),
                b.getTitle(),
                b.getText(),
                s3UrlService.getPublicUrl(b.getImage()),
                b.getCategoryId(),
                cat != null ? cat.getCode() : null,
                b.getSortOrder()
        );
    }
}
