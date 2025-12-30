<script setup lang="ts">
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import type { Exception, Result } from '@zxing/library';

const emit = defineEmits({
	// Validate scan payload is a string.
	scan: (code: string) => typeof code === `string`,
});

let reader: BrowserMultiFormatReader | null = null;
let controls: IScannerControls | null = null;
const scanning = ref(false);
const lastResult = ref(``);
let lastEmittedAt = 0;
const toast = ref(``);
let toastTimer: number | undefined;
const hints = new Map<DecodeHintType, unknown>([
	[DecodeHintType.TRY_HARDER, true],
	[DecodeHintType.POSSIBLE_FORMATS, [
		// 1D retail
		BarcodeFormat.EAN_13,
		BarcodeFormat.EAN_8,
		BarcodeFormat.UPC_A,
		BarcodeFormat.UPC_E,
		BarcodeFormat.CODE_128,
		BarcodeFormat.CODE_39,
		BarcodeFormat.CODE_93,
		BarcodeFormat.CODABAR,
		BarcodeFormat.ITF,
		BarcodeFormat.RSS_14,
		BarcodeFormat.RSS_EXPANDED,
		// 2D
		BarcodeFormat.QR_CODE,
		BarcodeFormat.DATA_MATRIX,
		BarcodeFormat.AZTEC,
	]],
]);

async function startScan() {
	if (scanning.value) {
		stopScan();
		return;
	}

	const videoElement = document.getElementById(`video`) as HTMLVideoElement | null;

	if (!videoElement) return;

	const videoConstraints: MediaStreamConstraints = {
		video: {
			facingMode: { ideal: `environment` },
			width: { ideal: 1280 },
			// Some browsers support this; ignored otherwise.
			advanced: [{ focusMode: `continuous` }] as Array<Record<string, unknown>>,
		},
	};

	// Reset previous session before starting a new one.
	controls?.stop();
	lastResult.value = ``;
	lastEmittedAt = 0;
	reader = new BrowserMultiFormatReader(hints);

	try {
		scanning.value = true;
		// Prompt camera permission so device discovery works on mobile.
		const stream = await navigator.mediaDevices.getUserMedia(videoConstraints);
		stream.getTracks().forEach(track => track.stop());

		const devices = await BrowserMultiFormatReader.listVideoInputDevices();
		const backCamera = devices.find(device => /back|rear|environment/i.test(device.label));
		const cameraId = backCamera?.deviceId;

		const handleResult = (result?: Result, error?: Exception) => {
			if (result) {
				const value = result.getText();
				// Ignore rapid duplicates to avoid double submissions.
				if (value === lastResult.value && Date.now() - lastEmittedAt < 750) return;

				lastResult.value = value;
				lastEmittedAt = Date.now();
				emit(`scan`, value);
				toast.value = `Scan: ${value}`;
				if (toastTimer) window.clearTimeout(toastTimer);
				toastTimer = window.setTimeout(() => {
					toast.value = ``;
				}, 1500);
			}
			else if (error && error.name !== `NotFoundException`) {
				// Surface unexpected decoding errors for easier debugging.
				console.error(error);
			}
		};

		if (cameraId) {
			(videoConstraints.video as MediaTrackConstraints).deviceId = { exact: cameraId };
		}

		controls = await reader.decodeFromConstraints(
			videoConstraints,
			videoElement,
			handleResult,
		);
	}
	catch (error) {
		console.error(error);
		stopScan();
	}
}

function stopScan() {
	controls?.stop();
	BrowserMultiFormatReader.releaseAllStreams();

	const videoElement = document.getElementById(`video`) as HTMLVideoElement | null;
	if (videoElement) {
		BrowserMultiFormatReader.cleanVideoSource(videoElement);
		videoElement.srcObject = null;
	}

	controls = null;
	reader = null;
	scanning.value = false;
	lastResult.value = ``;
	lastEmittedAt = 0;
}

onUnmounted(stopScan);
</script>

<template>
	<div class="relative flex flex-col gap-4">
		<video
			id="video"
			class="aspect-3/4 w-full rounded-lg border border-slate-200 bg-slate-100 object-cover"
			autoplay
			playsinline
			muted
		/>
		<button
			class="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
			@click="startScan"
		>
			<span v-if="!scanning">Lancer le scan</span>
			<span v-else>Stopper le scan</span>
		</button>

		<div
			v-if="toast"
			class="pointer-events-none absolute inset-x-0 -bottom-2 translate-y-full text-center"
		>
			<span class="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-200/50">
				{{ toast }}
			</span>
		</div>
	</div>
</template>
