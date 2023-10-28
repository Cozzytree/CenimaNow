import { useEffect, useState } from "react";

export function useLocalStorage(initialState, key) {
  const [watched, setWatched] = useState(() => {
    return localStorage.getItem(key)
      ? JSON.parse(localStorage.getItem(key))
      : initialState;
  });

  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(watched));
    },
    [watched, key]
  );
  return [watched, setWatched];
}
