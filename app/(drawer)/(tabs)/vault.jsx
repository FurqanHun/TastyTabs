import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { MealCard } from "../../../components/MealCard";

const VaultScreen = () => {
  const { width } = useWindowDimensions();

  const isDark = useSelector((state) => state.preferences.darkMode);

  const numColumns = width > 1024 ? 3 : width > 768 ? 2 : 1;

  const vaultItems = useSelector((state) => {
    if (state?.vault && Array.isArray(state?.vault?.items))
      return state?.vault?.items;
    if (Array.isArray(state?.vault)) return state?.vault;
    return [];
  });

  // 🦍 DYNAMIC STYLES
  const theme = {
    container: { backgroundColor: isDark ? "#121212" : "#fff" },
    text: { color: isDark ? "#fff" : "#333" },
    subText: { color: isDark ? "#aaa" : "#666" },
    badgeBg: { backgroundColor: isDark ? "#333" : "#F0F0F0" },
    badgeText: { color: isDark ? "#ccc" : "#666" },
    iconColor: isDark ? "#555" : "#ddd",
  };

  return (
    <SafeAreaView
      style={[styles.container, theme.container]}
      edges={["top", "left", "right"]}
    >
      <View style={styles.compactHeader}>
        <Text style={[styles.compactLabel, { color: theme.subText.color }]}>
          Saved Collection
        </Text>

        <View style={[styles.countBadge, theme.badgeBg]}>
          <Text style={[styles.countText, theme.badgeText]}>
            {vaultItems.length} items
          </Text>
        </View>
      </View>

      {vaultItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="heart-dislike-outline"
            size={50}
            color={theme.iconColor}
            style={{ marginBottom: 15 }}
          />
          <Text style={[styles.emptyText, theme.text]}>Vault is empty</Text>
          <Text style={[styles.emptySubText, theme.subText]}>
            Go find something tasty to save!
          </Text>
        </View>
      ) : (
        <FlatList
          key={numColumns}
          data={vaultItems}
          numColumns={numColumns}
          keyExtractor={(item) => item?.idMeal?.toString()}
          renderItem={({ item }) => (
            <View
              style={[styles.cardWrapper, { width: width / numColumns - 10 }]}
            >
              <MealCard meal={item} isHero={false} />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default VaultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  compactHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 15,
  },
  compactLabel: {
    fontSize: 18,
    fontWeight: "600",
  },
  countBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  countText: {
    fontWeight: "600",
    fontSize: 12,
  },

  listContent: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    paddingBottom: 20,
  },
  cardWrapper: {
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: -40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    // Color handled dynamically
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 5,
  },
});
