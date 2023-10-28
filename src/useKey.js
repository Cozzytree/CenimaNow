import { useEffect } from "react";

export function useKey(callback, key) {
  useEffect(
    function () {
      function close(e) {
        if (e.code === key) {
          callback();
        }
      }
      document.addEventListener("keydown", close);

      return function () {
        document.removeEventListener("keydown", close);
      };
    },
    [callback, key]
  );
}
