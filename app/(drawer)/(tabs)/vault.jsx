import React from "react";
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
import { Ionicons } from "@expo/vector-icons";

const VaultScreen = () => {
  const { width } = useWindowDimensions();

  const numColumns = width > 1024 ? 3 : width > 768 ? 2 : 1;

  const vaultItems = useSelector((state) => {
    if (state.vault && Array.isArray(state.vault.items))
      return state.vault.items;
    if (Array.isArray(state.vault)) return state.vault;
    return [];
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.compactHeader}>
        <Text style={styles.compactLabel}>Saved Collection</Text>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{vaultItems.length} items</Text>
        </View>
      </View>

      {vaultItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="heart-dislike-outline"
            size={50}
            color="#ddd"
            style={{ marginBottom: 15 }}
          />
          <Text style={styles.emptyText}>Vault is empty</Text>
          <Text style={styles.emptySubText}>
            Go find something tasty to save!
          </Text>
        </View>
      ) : (
        <FlatList
          key={numColumns}
          data={vaultItems}
          numColumns={numColumns}
          keyExtractor={(item) => item.idMeal.toString()}
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
    backgroundColor: "#fff",
  },

  compactHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  compactLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },
  countBadge: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  countText: {
    color: "#666",
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
    color: "#333",
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
  },
});
