package com.pashuraksha.api.cases;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiseaseCaseRepository extends JpaRepository<DiseaseCase, Long> {

    List<DiseaseCase> findByStatus(DiseaseCase.CaseStatus status);

    List<DiseaseCase> findBySeverity(DiseaseCase.Severity severity);

    List<DiseaseCase> findByDistrict(String district);

    @Query(value = "SELECT * FROM disease_cases dc " +
            "WHERE ST_Distance_Sphere(dc.location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)) <= :radiusMeters",
            nativeQuery = true)
    List<DiseaseCase> findCasesWithinRadius(@Param("lat") double latitude,
                                           @Param("lng") double longitude,
                                           @Param("radiusMeters") double radiusMeters);

    @Query(value = "SELECT dc.severity, COUNT(dc) FROM DiseaseCase dc GROUP BY dc.severity")
    List<Object[]> countCasesBySeverity();

    @Query(value = "SELECT dc.district, COUNT(dc) FROM DiseaseCase dc GROUP BY dc.district")
    List<Object[]> countCasesByDistrict();
}
