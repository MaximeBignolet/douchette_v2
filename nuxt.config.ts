// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
	modules: [`@nuxt/eslint`, `@vite-pwa/nuxt`],
	ssr: false,
	components: [
		{
			path: `~/components`,
			pathPrefix: false,
		},
	],
	imports: {
		dirs: [
			`composables/**`,
		],
	},
	devtools: { enabled: false },
	css: [`~/assets/css/main.css`],
	runtimeConfig: {
		public: {
			apiBaseUrl: process.env.API_BASE_URL,
		},
	},
	devServer: {
		host: `0.0.0.0`,
	},
	compatibilityDate: `2025-01-01`,
	vite: {
		build: {
			target: `esnext`,
		},
		plugins: [
			tailwindcss(),
		],
	},
	eslint: {
		config: {
			stylistic: {
				indent: `tab`,
				semi: true,
			},
		},
	},
	pwa: {
		registerType: `autoUpdate`,
		manifest: {
			name: `Scanner Logistique`,
			short_name: `Scanner`,
			start_url: `/`,
			display: `standalone`,
			theme_color: `#0f172a`,
			background_color: `#ffffff`,
			icons: [
				{
					src: `/rhinos_2025_vertical.png`,
					sizes: `192x192`,
					type: `image/png`,
				},
				{
					src: `/rhinos_2025_vertical.png`,
					sizes: `512x512`,
					type: `image/png`,
				},
			],
		},
	},
});
