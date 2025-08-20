<template>
	<el-table-column
		:prop="column.prop"
		:label="column.label"
		:align="column.align"
		:width="column.width"
		:sortable="!column.children && column.sortable"
	>
		<template slot-scope="scope">
			<div>{{scope.row[column.prop]}}</div>
		</template>
		<template v-if="column.children">
			<custom-table-column
				v-for="(item, index) in column.children"
				:key="index"
				:column="item"
			></custom-table-column>
		</template>
	</el-table-column>
</template>

<script>
export default {
	name: 'customTableColumn',
	props: {
		column: {
			type: Object,
			required: true
		}
	}
}
</script>