package com.pashuraksha.api.service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.InputStreamContent;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class GoogleDriveService {

    private Drive driveService;
    private GoogleAuthorizationCodeFlow flow;
    private static final String TARGET_FOLDER_NAME = "Storage_SIH";
    public static final String REDIRECT_URI = "http://localhost:8080/Callback";

    @PostConstruct
    public void init() {
        try {
            java.io.File clientSecretFile = new java.io.File("credentials.json");
            if (!clientSecretFile.exists()) {
                log.error("credentials.json not found!");
                return;
            }

            GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(
                    GsonFactory.getDefaultInstance(),
                    new InputStreamReader(new FileInputStream(clientSecretFile))
            );

            flow = new GoogleAuthorizationCodeFlow.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(), GsonFactory.getDefaultInstance(),
                    clientSecrets, Collections.singletonList(DriveScopes.DRIVE))
                    .setAccessType("offline")
                    .build();

            Credential credential = flow.loadCredential("user");
            if (credential != null && credential.getAccessToken() != null) {
                initializeDrive(credential);
            } else {
                String authUrl = flow.newAuthorizationUrl().setRedirectUri(REDIRECT_URI).build();
                log.warn("\n\n*********************************************************\n" +
                         "ACTION REQUIRED: GOOGLE DRIVE AUTHENTICATION MISSING!\n" +
                         "Please click the link below to authorize the backend:\n" +
                         authUrl + "\n" +
                         "*********************************************************\n");
            }
        } catch (Exception e) {
            log.error("Failed to init flow", e);
        }
    }

    public void initializeDrive(Credential credential) throws Exception {
        driveService = new Drive.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                credential)
                .setApplicationName("PashuRaksha")
                .build();
        log.info("Google Drive initialized successfully!");
    }

    public void exchangeCode(String code) throws Exception {
        TokenResponse response = flow.newTokenRequest(code).setRedirectUri(REDIRECT_URI).execute();
        Credential credential = flow.createAndStoreCredential(response, "user");
        initializeDrive(credential);
    }

    private Optional<String> getFolderIdByName(String folderName) throws IOException {
        String query = "mimeType='application/vnd.google-apps.folder' and name contains '" + folderName + "'";
        FileList result = driveService.files().list().setQ(query).setFields("files(id, name)").execute();
        List<File> folders = result.getFiles();
        if (folders == null || folders.isEmpty()) return Optional.empty();
        return Optional.of(folders.get(0).getId());
    }

    public String uploadFile(MultipartFile file) throws IOException {
        if (driveService == null) throw new IOException("Drive Service is not initialized. Please click the login link in the server logs.");
        Optional<String> folderIdOpt = getFolderIdByName(TARGET_FOLDER_NAME);
        File fileMetadata = new File();
        fileMetadata.setName(file.getOriginalFilename());
        if (folderIdOpt.isPresent()) fileMetadata.setParents(Collections.singletonList(folderIdOpt.get()));
        InputStreamContent mediaContent = new InputStreamContent(file.getContentType(), file.getInputStream());
        File uploadedFile = driveService.files().create(fileMetadata, mediaContent).setFields("id, name, webViewLink").execute();
        return uploadedFile.getWebViewLink();
    }
}

@RestController
class GoogleDriveAuthController {
    private final GoogleDriveService googleDriveService;
    public GoogleDriveAuthController(GoogleDriveService googleDriveService) {
        this.googleDriveService = googleDriveService;
    }

    @GetMapping("/Callback")
    public String callback(@RequestParam String code) {
        try {
            googleDriveService.exchangeCode(code);
            return "<h2>✅ Success! Google Drive is now connected!</h2><p>You can close this tab and go upload your files!</p>";
        } catch (Exception e) {
            return "<h2>❌ Failed</h2><p>" + e.getMessage() + "</p>";
        }
    }
}
