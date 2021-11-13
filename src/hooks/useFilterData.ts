import { ref } from "@vue/reactivity";
import { UserFormData } from "../interface/User";

export function useFilterData(baseFm: any) {
  const form = ref<UserFormData>(Object.assign({}, baseFm));
  return { baseFm, form };
}
