package com.pashuraksha.backend.repository;

import com.pashuraksha.backend.entity.Cluster;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ClusterRepository extends JpaRepository<Cluster, UUID> {
}
