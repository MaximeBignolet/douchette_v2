<script setup lang="ts">
const ean = ref(``);

function onScan(code: string) {
	ean.value = code;
}
</script>

<template>
	<main class="min-h-screen bg-white text-slate-900">
		<div class="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
			<h1 class="text-2xl font-semibold">
				Scanner
			</h1>

			<section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
				<div class="flex items-center justify-between text-sm text-slate-600">
					<span>Dernier code</span>
					<span class="font-semibold text-slate-900">{{ ean || `—` }}</span>
				</div>
				<input
					v-model="ean"
					class="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
					placeholder="Entrer un code"
				>
			</section>

			<section class="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
				<BarcodeScanner @scan="onScan" />
			</section>
		</div>
	</main>
</template>
