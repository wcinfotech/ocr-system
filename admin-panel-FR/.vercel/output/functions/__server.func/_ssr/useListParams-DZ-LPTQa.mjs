import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@ckeditor/ckeditor5-react+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useListParams-DZ-LPTQa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* Local state manager for server-driven tables (pagination/search/sort/filters).
* Resets to page 0 whenever search, sort or filters change.
*/
function useListParams(initial) {
	const [page, setPage] = (0, import_react.useState)(initial?.page ?? 0);
	const [pageSize, setPageSize] = (0, import_react.useState)(initial?.pageSize ?? 10);
	const [search, setSearchValue] = (0, import_react.useState)(initial?.search ?? "");
	const [sortBy, setSortBy] = (0, import_react.useState)(initial?.sortBy);
	const [sortDir, setSortDir] = (0, import_react.useState)(initial?.sortDir);
	const [filters, setFiltersValue] = (0, import_react.useState)(initial?.filters ?? {});
	const setSearch = (v) => {
		setSearchValue(v);
		setPage(0);
	};
	const setSort = (key, dir) => {
		setSortBy(key);
		setSortDir(dir);
		setPage(0);
	};
	const setFilter = (key, value) => {
		setFiltersValue((prev) => ({
			...prev,
			[key]: value
		}));
		setPage(0);
	};
	return {
		params: (0, import_react.useMemo)(() => ({
			page: page + 1,
			pageSize,
			search,
			sortBy,
			sortDir,
			filters
		}), [
			page,
			pageSize,
			search,
			sortBy,
			sortDir,
			filters
		]),
		page,
		pageSize,
		search,
		sortBy,
		sortDir,
		filters,
		setPage,
		setPageSize,
		setSearch,
		setSort,
		setFilter
	};
}
//#endregion
export { useListParams as t };
