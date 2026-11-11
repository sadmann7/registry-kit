import { commentStyle, noLowValueComments } from "./comment-style.ts";

export default {
  meta: { name: "registry-kit" },
  rules: {
    "comment-style": commentStyle,
    "no-low-value-comments": noLowValueComments,
  },
};
