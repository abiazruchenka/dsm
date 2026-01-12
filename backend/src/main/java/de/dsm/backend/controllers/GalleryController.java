package de.dsm.backend.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/galleries")
@RequiredArgsConstructor
@Validated
@Tag(name = "Galleries", description = "Galleries management operations")
public class GalleryController {
}
