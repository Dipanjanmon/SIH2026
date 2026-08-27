package com.pashuraksha.backend.controller;

import com.pashuraksha.backend.entity.Cluster;
import com.pashuraksha.backend.repository.ClusterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clusters")
@RequiredArgsConstructor
public class ClusterController {

    private final ClusterRepository clusterRepository;

    @GetMapping
    public ResponseEntity<List<Cluster>> getAllClusters() {
        return ResponseEntity.ok(clusterRepository.findAll());
    }
}
