package de.dsm.backend.controllers;

import de.dsm.backend.models.dto.BlockDetailResponse;
import de.dsm.backend.models.dto.BlockRequest;
import de.dsm.backend.models.dto.BlockResponse;
import de.dsm.backend.models.dto.BlocksByCategoryResponse;
import de.dsm.backend.models.dto.CategoryCreateRequest;
import de.dsm.backend.models.dto.CategoryResponse;
import de.dsm.backend.services.ReenactmentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reenactment")
@RequiredArgsConstructor
@Tag(name = "Reenactment", description = "Reenactment page blocks")
public class ReenactmentController {

    private final ReenactmentService reenactmentService;

    /** Blocks grouped by category */
    @GetMapping
    public List<BlocksByCategoryResponse> getBlocksGroupedByCategory() {
        return reenactmentService.getBlocksGroupedByCategory();
    }

    @GetMapping("/categories")
    public List<CategoryResponse> getCategories() {
        return reenactmentService.getCategories();
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        return reenactmentService.createCategory(request);
    }

    @PatchMapping("/categories/{id}")
    public CategoryResponse updateCategory(@PathVariable UUID id, @Valid @RequestBody CategoryCreateRequest request) {
        return reenactmentService.updateCategory(id, request);
    }

    @DeleteMapping("/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable UUID id) {
        reenactmentService.deleteCategory(id);
    }

    @GetMapping("/blocks/{id}")
    public BlockDetailResponse getBlockById(@PathVariable UUID id) {
        return reenactmentService.getBlockById(id);
    }

    @PostMapping("/blocks")
    @ResponseStatus(HttpStatus.CREATED)
    public BlockResponse createBlock(@Valid @RequestBody BlockRequest request) {
        return reenactmentService.createBlock(request);
    }

    @PatchMapping("/blocks/{id}")
    public BlockResponse updateBlock(@PathVariable UUID id, @Valid @RequestBody BlockRequest request) {
        return reenactmentService.updateBlock(id, request);
    }

    @DeleteMapping("/blocks/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBlock(@PathVariable UUID id) {
        reenactmentService.deleteBlock(id);
    }
}
