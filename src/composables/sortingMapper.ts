export function useSortUtils() {
  const sortMap = {
    ascend: "ASC",
    descend: "DESC",
  };

  function mapSort(sort: "ascend" | "descend") {
    return sortMap[sort];
  }

  return { mapSort };
}
