<template>
  <section class="send-youtube-card">
    <h2>Send to YouTube</h2>

    <label class="field">
      <span>Video Title</span>
      <input v-model="title" placeholder="Enter video title" />
    </label>

    <label class="field">
      <span>Description</span>
      <textarea
        v-model="description"
        placeholder="Enter video description"
      ></textarea>
    </label>

    <label class="field">
      <span>Privacy</span>
      <select v-model="privacyStatus">
        <option value="private">Private</option>
        <option value="unlisted">Unlisted</option>
        <option value="public">Public</option>
      </select>
    </label>

    <label class="field">
      <span>Thumbnail Image</span>
      <input
        type="file"
        accept="image/png,image/jpeg"
        @change="handleThumbnailSelect"
      />
    </label>

    <div v-if="thumbnailUrl" class="thumbnail-preview-wrap">
      <p>Selected thumbnail: {{ thumbnailName }}</p>
      <img
        class="thumbnail-preview"
        :src="thumbnailUrl"
        alt="Selected thumbnail preview"
      />
    </div>

    <button
      class="button"
      :disabled="!videoFile || !accessToken || isUploading"
      @click="uploadToYouTube"
    >
      {{ isUploading ? "Uploading..." : "Upload to YouTube" }}
    </button>

    <p v-if="!videoFile">No video selected yet.</p>
    <p v-if="!accessToken">Connect YouTube before uploading.</p>

    <div class="status-box" v-if="videoStatus || thumbnailStatus || uploadMessage">
      <p v-if="videoStatus"><strong>Video:</strong> {{ videoStatus }}</p>
      <p v-if="thumbnailStatus"><strong>Thumbnail:</strong> {{ thumbnailStatus }}</p>
      <p v-if="uploadMessage"><strong>Status:</strong> {{ uploadMessage }}</p>
    </div>
    <button
      v-if="uploadedVideoId"
      class="button"
      @click="openUploadedVideo"
    >
      View uploaded video
    </button>
  </section>
</template>

<script setup>
import { ref, onUnmounted } from "vue";
import "../css/SendToYoutube.css";

const props = defineProps({
  videoFile: {
    type: File,
    default: null,
  },
  accessToken: {
    type: String,
    default: "",
  },
});

const title = ref("My Uploaded Video");
const description = ref("Uploaded from DSOTS-GUI");
const privacyStatus = ref("private");

const thumbnailFile = ref(null);
const thumbnailUrl = ref("");
const thumbnailName = ref("");

const isUploading = ref(false);
const uploadMessage = ref("");
const videoStatus = ref("");
const thumbnailStatus = ref("");
const uploadedVideoId = ref("");

async function openUploadedVideo() {
  if (!uploadedVideoId.value) return;

  const url = `https://www.youtube.com/watch?v=${uploadedVideoId.value}`;

  try {
    await window.electronAPI.openExternal(url);
  } catch (error) {
    console.error("Failed to open external URL:", error);
    alert("Could not open the video in your browser.");
  }
}

function handleThumbnailSelect(event) {
  const file = event.target.files?.[0];

  if (!file) return;

  const allowedTypes = ["image/jpeg", "image/png"];

  if (!allowedTypes.includes(file.type)) {
    alert("Please upload a .jpg, .jpeg, or .png thumbnail.");
    event.target.value = "";
    return;
  }

  const maxSizeBytes = 2 * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    alert("Thumbnail must be 2 MB or smaller.");
    event.target.value = "";
    return;
  }

  if (thumbnailUrl.value) {
    URL.revokeObjectURL(thumbnailUrl.value);
  }

  thumbnailFile.value = file;
  thumbnailName.value = file.name;
  thumbnailUrl.value = URL.createObjectURL(file);
}

async function uploadToYouTube() {
  if (!props.videoFile) {
    alert("Please select an .mp4 file first.");
    return;
  }

  if (!props.accessToken) {
    alert("Please connect YouTube first.");
    return;
  }

  if (!window.electronAPI?.uploadToYouTube) {
    alert("Electron upload bridge is missing. Check preload.cjs and main.cjs.");
    return;
  }

  isUploading.value = true;
  uploadMessage.value = "";
  videoStatus.value = "Reading video file...";
  thumbnailStatus.value = thumbnailFile.value
    ? "Thumbnail selected. Waiting for video upload to finish..."
    : "No thumbnail selected.";
  uploadedVideoId.value = "";

  try {
    const filePath = window.electronAPI.getPathForFile(props.videoFile);

    if (!filePath) {
      throw new Error("Could not get video file path.");
    }

    videoStatus.value = "Uploading video to YouTube...";

    const result = await window.electronAPI.uploadToYouTube({
      accessToken: props.accessToken,
      filePath,
      fileName: props.videoFile.name,
      title: title.value,
      description: description.value,
      privacyStatus: privacyStatus.value,
      contentType: props.videoFile.type || "video/mp4",
    });

    console.log("YouTube upload result:", result);

    uploadedVideoId.value = result.id;

    videoStatus.value =
      "Video upload complete. YouTube may still process it in the background.";

    if (thumbnailFile.value) {
      if (!window.electronAPI?.setYouTubeThumbnail) {
        throw new Error(
          "Electron thumbnail bridge is missing. Check preload.cjs and main.cjs."
        );
      }

      thumbnailStatus.value = "Uploading thumbnail to YouTube...";

      const thumbnailArrayBuffer = await thumbnailFile.value.arrayBuffer();

      await window.electronAPI.setYouTubeThumbnail({
        accessToken: props.accessToken,
        videoId: result.id,
        thumbnailBuffer: Array.from(new Uint8Array(thumbnailArrayBuffer)),
        contentType: thumbnailFile.value.type,
      });

      thumbnailStatus.value = "Thumbnail upload complete.";
      uploadMessage.value = "Done. Video and thumbnail were sent to YouTube.";
    } else {
      thumbnailStatus.value = "No thumbnail selected.";
      uploadMessage.value = "Done. Video was sent to YouTube.";
    }
  } catch (error) {
    console.error(error);
    uploadMessage.value = error.message || "Upload failed.";
    videoStatus.value = "Video upload failed.";
  } finally {
    isUploading.value = false;
  }
}

onUnmounted(() => {
  if (thumbnailUrl.value) {
    URL.revokeObjectURL(thumbnailUrl.value);
  }
});
</script>
