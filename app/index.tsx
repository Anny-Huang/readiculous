// app/index.tsx
import { Redirect } from "expo-router";

export default function IndexPage() {
  return <Redirect href="/signin" />;
}
