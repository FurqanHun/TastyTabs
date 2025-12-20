import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
  return (
    <Drawer screenOptions={{ headerShown: true }}>
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: "Home",
          title: "TastyTabs", // top bar title
        }}
      />
      {/* If settings.jsx is added later, it goes here */}
    </Drawer>
  );
}
