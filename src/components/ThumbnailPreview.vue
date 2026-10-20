<script setup>
defineProps({
	thumbnail: {
		type: Object,
		required: true,
	},
	leftPlayer: {
		type: Object,
		required: true,
	},
	rightPlayer: {
		type: Object,
		required: true,
	},
	leftCharacterImage: {
		type: String,
		required: true,
	},
	rightCharacterImage: {
		type: String,
		required: true,
	},
	logoPath: {
		type: String,
		required: true,
	},
})

function portClass(player, port) {
	return {
		lit: player.port === port,
	}
}

function nameStyle(name) {
	const safeLength = Math.max(name.length, 1)

	return {
		'--name-length': safeLength,
	}
}
</script>

<template>
	<article class="thumbnail">
		<img class="background" :src="thumbnail.background" alt="" />

		<div class="player-info player-info-left">
			<h2 :style="nameStyle(leftPlayer.name)">
				{{ leftPlayer.name }}
			</h2>

			<div class="ports">
				<span
					v-for="port in [1, 2, 3, 4]"
					:key="port"
					:class="portClass(leftPlayer, port)"
				></span>
			</div>
		</div>

		<div class="player-info player-info-right">
			<h2 :style="nameStyle(rightPlayer.name)">
				{{ rightPlayer.name }}
			</h2>

			<div class="ports">
				<span
					v-for="port in [1, 2, 3, 4]"
					:key="port"
					:class="portClass(rightPlayer, port)"
				></span>
			</div>
		</div>

		<img class="character character-left" :src="leftCharacterImage" alt="" />
		<img class="character character-right" :src="rightCharacterImage" alt="" />

		<div class="center-info">
			<div class="versus">VS</div>

			<h1 class="event-name">
				{{ thumbnail.eventName }}
			</h1>

			<img class="logo" :src="logoPath" alt="DSOTS logo" />

			<h2 class="set-name">
				{{ thumbnail.setName }}
			</h2>

			<h3 class="game-name">
				{{ thumbnail.gameName }}
			</h3>
		</div>
	</article>
</template>

<style scoped>
.thumbnail {
	position: relative;
	overflow: hidden;
	width: 1280px;
	aspect-ratio: 16 / 9;
    /*scale it but dont change the dimensions in exported */
	transform: scale(calc(100cqw / 1280px));
	transform-origin: top left;
	margin: 0 auto;
	/* border-radius: 18px; */
	background: white;
	color: black;
	font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
	box-shadow: var(--shadow);
}

.background {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	opacity: 0.78;
}

.player-info,
.center-info,
.character {
	position: absolute;
	z-index: 1;
}

.player-info {
	top: 7%;
	width: 36%;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.45rem;
	color: #bf95f9;
	-webkit-text-stroke: 2px black;
}

.player-info-left {
	left: 2%;
}

.player-info-right {
	right: 2%;
}

.player-info h2 {
	margin: 0;
	max-width: 100%;
	font-size: clamp(2.05rem, calc(38rem / var(--name-length)), 5.25rem);
	line-height: 0.9;
	letter-spacing: 0.02em;
	text-align: center;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: clip;
}

.ports {
	display: flex;
	gap: 0.4rem;
}

.ports span {
	width: 26.88px;
	height: 26.88px;
	border-radius: 999px;
	border: 4px solid #30c3ee;
	background: #2b2e3b;
}

.ports span.lit {
	background: #ff7ac6;
}

.character {
	top: 27%;
	width: 34%;
	height: 54%;
	object-fit: contain;
	filter: drop-shadow(0 16px 10px rgba(0, 0, 0, 0.35));
}

.character-left {
	left: 2%;
}

.character-right {
	right: 2%;
}

.center-info {
	inset: 7% 31% 8%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	color: #fff;
	-webkit-text-stroke: 2px black;
}

.versus {
    margin-top: 2.5rem;
	font-size: 5.8rem;
	font-weight: bold;
	line-height: 0.8;
	color: #ff7ac6;
	-webkit-text-stroke: 2px black;
}

.event-name {
	color: gold;
	margin: 0;
	font-size: 3.52rem;
	line-height: 0.85;
	text-transform: uppercase;
	-webkit-text-stroke: 2px black;
}

.logo {
	width: 100%;
	max-height: 66%;
	object-fit: contain;
	filter: drop-shadow(0 8px 5px rgba(0, 0, 0, 0.45));
}

.set-name {
	margin: 0;
	font-size: 3.6rem;
	line-height: 0.9;
}

.game-name {
	margin: 0.35rem 0 0;
	font-size: 2.72rem;
	line-height: 0.95;
	-webkit-text-stroke: 2px black;
}

</style>
