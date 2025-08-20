<template>
	<div id="app">
		<router-view />
	</div>
</template>
<script>
import client from 'webpack-theme-color-replacer/client'
import forElementUI from 'webpack-theme-color-replacer/forElementUI'
export default {
	data() {
		return {
			fullScreenUrls: [
				'/',
				'/login',
				'/home',
				'/editor',
				'/flowDisplay',
				'/404'
			]
		}
	},
	watch: {
		$route(to, from) {
			let title = to.meta.title
			if (!title) {
				title = to.query.title
			}
			if (!this.fullScreenUrls.includes(to.path)) {
				this.$store.commit('worktabRoute', {
					to: {
						name: to.name,
						title: title,
						path: to.fullPath
					}
				})
			}
		}
	},
	created() {
		this.changeColor()
	},
	methods: {
		changeColor() {
			let color = localStorage.getItem('color') || '#3a6cfa'
			if (color) {
				var options = {
					newColors: [...forElementUI.getElementUISeries(color)]
				}
				client.changer.changeColor(options, Promise).then(() => {})
			}
		}
	}
}
</script>
