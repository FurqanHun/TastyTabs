

// import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
// import { useSelector } from "react-redux";
// import { MealCard } from "../../../components/MealCard"; // Path check kar lein apne folder ke hisab se

// const VaultScreen = () => {
//   // Redux se data nikalna (Safe selector)
//   const vaultItems = useSelector((state) => {
//     if (state.vault && Array.isArray(state.vault.items)) return state.vault.items;
//     if (Array.isArray(state.vault)) return state.vault;
//     return [];
//   });

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>My Recipe Vault</Text>
//         <Text style={styles.subtitle}>
//           {vaultItems.length} {vaultItems.length === 1 ? "Recipe" : "Recipes"} Saved
//         </Text>
//       </View>

//       {vaultItems.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Text style={styles.emptyText}>Apka vault abhi khali hai! ❤️</Text>
//           <Text style={styles.emptySubText}>Recipe save karein yahan dekhne ke liye.</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={vaultItems}
//           keyExtractor={(item) => item.idMeal.toString()}
//           renderItem={({ item }) => (
//             <View style={styles.cardWrapper}>
//               {/* isHero={false} rakha hai taake normal list dikhe */}
//               <MealCard meal={item} isHero={false} />
//             </View>
//           )}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default VaultScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f8f8f8",
//   },
//   header: {
//     padding: 20,
//     backgroundColor: "#fff",
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   subtitle: {
//     fontSize: 14,
//     color: "#666",
//     marginTop: 4,
//   },
//   listContent: {
//     paddingVertical: 10,
//     alignItems: "center", // Card ko center karne ke liye
//   },
//   cardWrapper: {
//     marginBottom: 10,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#444",
//   },
//   emptySubText: {
//     fontSize: 14,
//     color: "#888",
//     marginTop: 8,
//     textAlign: "center",
//   },
// });



import React from "react";
import { 
  FlatList, 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  View, 
  useWindowDimensions 
} from "react-native";
import { useSelector } from "react-redux";
import { MealCard } from "../../../components/MealCard";

const VaultScreen = () => {
  const { width } = useWindowDimensions();
  
  // Responsive Columns Logic
  // Desktop (>1024px): 3 columns
  // Tablet (>768px): 2 columns
  // Mobile: 1 column
  const numColumns = width > 1024 ? 3 : width > 768 ? 2 : 1;

  const vaultItems = useSelector((state) => {
    if (state.vault && Array.isArray(state.vault.items)) return state.vault.items;
    if (Array.isArray(state.vault)) return state.vault;
    return [];
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Recipe Vault</Text>
        <Text style={styles.subtitle}>
          {vaultItems.length} {vaultItems.length === 1 ? "Recipe" : "Recipes"} Saved
        </Text>
      </View>

      {vaultItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Apka vault abhi khali hai! ❤️</Text>
          <Text style={styles.emptySubText}>Recipe save karein yahan dekhne ke liye.</Text>
        </View>
      ) : (
        <FlatList
          /* key change karna zaroori hai jab columns change hon desktop/mobile switch par */
          key={numColumns} 
          data={vaultItems}
          numColumns={numColumns}
          keyExtractor={(item) => item.idMeal.toString()}
          renderItem={({ item }) => (
            <View style={[styles.cardWrapper, { width: width / numColumns - 10 }]}>
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
    backgroundColor: "#f8f8f8",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 5,
    paddingVertical: 10,
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
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
  },
  emptySubText: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },
});