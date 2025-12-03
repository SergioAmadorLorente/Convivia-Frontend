import { useNavigationState } from "@react-navigation/native";
import { COLORS } from "../styles/theme";
export const useTabColor = (tabName: string) => {
   const routes = useNavigationState(state => state.routes);
   const index = useNavigationState(state => state.index);
   const activeRoute = routes[index].name;
   return activeRoute === tabName ? COLORS.accent : COLORS.primary;
};