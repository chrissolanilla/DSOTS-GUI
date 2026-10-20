<!-- <script setup> -->
<!-- import Navbar from './components/Navbar.vue' -->
<!-- </script> -->
<!---->
<!-- <template> -->
<!--     <Navbar /> -->
<!--     <!-- we want to split the page into 2 parts, the left and right player --> -->
<!--     <!-- have a form for each player where you enter their name, their port number(a radio button from left to right of slot 1-4) --> -->
<!--     <!-- and then finally a drop down on what character they play --> -->
<!--     <!-- once they select the character, they can then choose what color character they played --> -->
<!--     <!-- finally it will use these to dynamically generate a thumbnail. The background for all thumbnails will use the stadium.png as the main background --> -->
<!--     <!-- the user should be able to choose whether they wnat to use the red or yellow DSOTS logo --> -->
<!-- </template> -->
<script setup>

// add router for upload video
import { useRouter } from "vue-router";

const router = useRouter();

function uploadVideo() {
  router.push("/upload-video");
}

// end of upload video function


import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { toPng } from 'html-to-image'
import Navbar from '../components/Navbar.vue'
import PlayerForm from '../components/PlayerForm.vue'
import ThumbnailPreview from '../components/ThumbnailPreview.vue'

const publicPath = import.meta.env.BASE_URL

const thumbnailRef = ref(null)

let previewObserver

onMounted(() => {
	previewObserver = new ResizeObserver(([{ target, contentRect }]) => {
		target.style.setProperty('--preview-scale', contentRect.width / 1280)
	})
	previewObserver.observe(thumbnailRef.value)
})

onBeforeUnmount(() => previewObserver?.disconnect())

const characters = [
	{ label: 'Bowser', value: 'bowser', filePrefix: 'bowser', colors: 4 },
	{ label: 'Captain Falcon', value: 'captainFalcon', filePrefix: 'captainfalcon', colors: 6 },
	{ label: 'Donkey Kong', value: 'donkeyKong', filePrefix: 'donkeykong', colors: 5 },
	{ label: 'Dr. Mario', value: 'drMario', filePrefix: 'drmario', colors: 5 },
	{ label: 'Falco', value: 'falco', filePrefix: 'falco', colors: 4 },
	{ label: 'Fox', value: 'fox', filePrefix: 'fox', colors: 4 },
	{ label: 'Ganondorf', value: 'ganondorf', filePrefix: 'ganondorf', colors: 5 },
	{ label: 'Ice Climbers', value: 'iceClimbers', filePrefix: 'iceclimbers', colors: 4 },
	{ label: 'Jigglypuff', value: 'jigglypuff', filePrefix: 'jigglypuff', colors: 5 },
	{ label: 'Kirby', value: 'kirby', filePrefix: 'kirby', colors: 6 },
	{ label: 'Link', value: 'link', filePrefix: 'link', colors: 5 },
	{ label: 'Luigi', value: 'luigi', filePrefix: 'luigi', colors: 4 },
	{ label: 'Mario', value: 'mario', filePrefix: 'mario', colors: 5 },
	{ label: 'Marth', value: 'marth', filePrefix: 'marth', colors: 5 },
	{ label: 'Mewtwo', value: 'mewtwo', filePrefix: 'mewtwo', colors: 4 },
	{ label: 'Mr. Game & Watch', value: 'mrGameAndWatch', filePrefix: 'mrgameandwatch', colors: 4 },
	{ label: 'Ness', value: 'ness', filePrefix: 'ness', colors: 4 },
	{ label: 'Peach', value: 'peach', filePrefix: 'peach', colors: 5 },
	{ label: 'Pichu', value: 'pichu', filePrefix: 'pichu', colors: 4 },
	{ label: 'Pikachu', value: 'pikachu', filePrefix: 'pikachu', colors: 4 },
	{ label: 'Roy', value: 'roy', filePrefix: 'roy', colors: 5 },
	{ label: 'Samus', value: 'samus', filePrefix: 'samus', colors: 5 },
	{ label: 'Yoshi', value: 'yoshi', filePrefix: 'yoshi', colors: 6 },
	{ label: 'Young Link', value: 'youngLink', filePrefix: 'younglink', colors: 5 },
	{ label: 'Zelda / Sheik', value: 'zeldaAndSheik', filePrefix: 'zeldaandsheik', colors: 5 },
]

const playerLeft = ref({
	name: 'Bustopher',
	port: 4,
	character: 'fox',
	color: 1,
})

const playerRight = ref({
	name: 'Suck2Johnsons',
	port: 1,
	character: 'captainFalcon',
	color: 4,
})

const thumbnail = ref({
	eventName: 'DSOTS 69',
	setName: 'Grand Finals',
	gameName: 'Melee',
	logo: 'yellow',
    background: `${publicPath}assets/stadium.png`,
})

const selectedLogoPath = computed(() => {
	return thumbnail.value.logo === 'red'
		? `${publicPath}assets/dsots-red.png`
		: `${publicPath}assets/dsots-yellow.png`
})

function getCharacterMeta(characterValue) {
	return characters.find((character) => character.value === characterValue)
}

function getCharacterImage(player) {
	const character = getCharacterMeta(player.character)

	if (!character) {
		return ''
	}

    return `${publicPath}characterAssetsChris/${character.value}/${character.filePrefix}${player.color}.png`
}


async function downloadThumbnail() {
	if (!thumbnailRef.value) return

	try {
		const dataUrl = await toPng(thumbnailRef.value.firstElementChild, {
			cacheBust: true,
			pixelRatio: 2,
			backgroundColor: '#ffffff',
			style: { transform: 'none' },
			//copy the full font last to preserve the preview's exact text wrapping
			includeStyleProperties: [...getComputedStyle(document.documentElement), 'font'],
		})

		const link = document.createElement('a')
		link.download = `${playerLeft.value.name}-vs-${playerRight.value.name}.png`
		link.href = dataUrl
		link.click()
	} catch (error) {
		console.error('Thumbnail export failed:', error)
	}
}
</script>

<template>
	<div class="app-shell">
		<Navbar />

		<main class="page-wrap">
			<h2 class="page-title">Melee Thumbnail Generator</h2>
			<section class="page-stack">
				<div class="panel">
					<h3>Match Info</h3>

					<label class="field">
						<span>Event Name</span>
						<input v-model="thumbnail.eventName" />
					</label>

					<label class="field">
						<span>Set</span>
                        <input
                            v-model="thumbnail.setName"
                            placeholder="Grand Finals"
                        />
					</label>

					<label class="field">
						<span>Game</span>
						<input v-model="thumbnail.gameName" />
					</label>

					<label class="field">
						<span>Logo Color</span>
						<select v-model="thumbnail.logo">
							<option value="red">Red DSOTS Logo</option>
							<option value="yellow">Yellow DSOTS Logo</option>
						</select>
					</label>
				</div>

				<PlayerForm
					title="Left Player"
					v-model:player="playerLeft"
					:characters="characters"
				/>

				<PlayerForm
					title="Right Player"
					v-model:player="playerRight"
					:characters="characters"
				/>
			</section>

			<section class="preview-area">
				<div class="button-row">
					<button class="button" @click="downloadThumbnail">
						Download Thumbnail
					</button>
				</div>

                <div ref="thumbnailRef" class="export-target">
                    <ThumbnailPreview
                            :thumbnail="thumbnail"
                            :left-player="playerLeft"
                            :right-player="playerRight"
                            :left-character-image="getCharacterImage(playerLeft)"
                            :right-character-image="getCharacterImage(playerRight)"
                            :logo-path="selectedLogoPath"
                    />
                </div>
				<!-- <ThumbnailPreview -->
				<!-- 	ref="thumbnailRef" -->
				<!-- 	:thumbnail="thumbnail" -->
				<!-- 	:left-player="playerLeft" -->
				<!-- 	:right-player="playerRight" -->
				<!-- 	:left-character-image="getCharacterImage(playerLeft)" -->
				<!-- 	:right-character-image="getCharacterImage(playerRight)" -->
				<!-- 	:logo-path="selectedLogoPath" -->
				<!-- /> -->
			</section>

			<section class="upload-video-section">
				<div class="upload-video-container">
					<button class="button" @click="uploadVideo">
					Upload Video
					</button>
				</div>
			</section>
		</main>

		<router-view/>
	</div>
</template>

<style scoped>
.panel,
.preview-area {
	padding: 1rem;
	border: 1px solid var(--border);
	border-radius: 22px;
	background: var(--surface-color);
	box-shadow: var(--shadow);
}

.panel h3 {
	margin: 0 0 1rem;
}

.field {
	display: flex;
	flex-direction: column;
	gap: 0.4rem;
	margin-bottom: 0.85rem;
}

.field span {
	color: var(--muted-text);
	font-weight: 800;
}

.field input,
.field select {
	width: 100%;
	border: 1px solid var(--border);
	border-radius: 14px;
	padding: 0.75rem 0.85rem;
	background: var(--surface-color-2);
	color: var(--text-color);
}

.preview-area {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.export-target {
	width: min(100%, 1280px);
	aspect-ratio: 16 / 9;
	overflow: hidden;
	margin: 0 auto;
}
</style>
