import { router } from "expo-router";
import { Search } from "lucide-react-native";
import { useCallback, useState } from "react";
import { FlatList, RefreshControl, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { ExosCard, ProgsCard } from "@/components/data-card";
import { CategorySkeletonList, ExosSkeletonList, ProgsSkeletonList } from "@/components/data-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAuth } from "@/context/auth";
import useFetch from "@/lib/api";
import { useColorScheme } from "@/lib/color";

export default function App() {
    const { isDarkColorScheme } = useColorScheme();
    const { authState } = useAuth();

    const [searchTerm, setSearchTerm] = useState<string>(null);

    const {
        data: exosData,
        isLoading: exosLoad,
        error: exosError,
        refetch: exosRefetch,
    }: ExosData = useFetch("GET", "exos/all");
    const {
        data: progsData,
        isLoading: progsLoad,
        error: progsError,
        refetch: progsRefetch,
    }: ProgsData = useFetch("GET", `progs/all?username=${authState.token}`);

    const [refreshing, setRefreshing] = useState<boolean>(false);
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        exosRefetch();
        progsRefetch();
        setRefreshing(false);
    }, [setRefreshing, exosRefetch]);

    const sayHello = () => {
        const hour = new Date().getHours();
        return hour >= 6 && hour < 18 ? "Bonjour" : "Bonsoir";
    };

    return (
        <SafeAreaView className="flex-1 bg-background px-3">
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View>
                    <View className="mt-3">
                        <Text className="text-2xl text-foreground">
                            {sayHello()} {authState.token.charAt(0).toUpperCase() + authState.token.slice(1)} !
                        </Text>
                        <Text className="text-3xl font-semibold leading-tight text-foreground">
                            Trouvez votre programme d'entraînement parfait !
                        </Text>
                    </View>
                    <View className="my-3 flex flex-row items-center justify-center">
                        <View className="mr-3 flex-1">
                            <Input
                                value={searchTerm}
                                onChangeText={(text) => setSearchTerm(text)}
                                placeholder="Que recherchez vous ?"
                            />
                        </View>
                        <Button
                            variant="default"
                            size="icon_lg"
                            onPress={() => {
                                if (searchTerm) router.push(`/search/${searchTerm}`);
                            }}
                        >
                            <Search color={isDarkColorScheme ? "black" : "white"} />
                        </Button>
                    </View>
                    <View className="my-3">
                        {exosLoad ? (
                            <View className="flex-row">
                                <CategorySkeletonList count={4} />
                            </View>
                        ) : exosError ? (
                            <Text className="text-foreground">Erreur lors du chargement des badges</Text>
                        ) : (
                            <FlatList
                                showsHorizontalScrollIndicator={false}
                                data={[
                                    "Quadriceps",
                                    "Ischio-jambiers",
                                    "Pectoraux",
                                    "Deltoides",
                                    "Abdominaux",
                                    "Biceps",
                                    "Triceps",
                                    "Dos",
                                ]}
                                renderItem={({ item, index }: { item: string; index: number }) => (
                                    <TouchableOpacity onPress={() => router.push(`/search/${item}`)} key={index}>
                                        <Badge label={item} variant="outline" />
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item) => item.toLowerCase()}
                                contentContainerStyle={{ columnGap: 10 }}
                                horizontal
                            />
                        )}
                    </View>
                </View>
                <View className="my-3">
                    <View className="flex flex-row items-center justify-between">
                        <Text className="text-xl font-semibold text-foreground">Programmes recommandés</Text>
                        <Button variant="ghost" onPress={() => router.push("/progs/create")}>
                            <Text className="font-medium text-muted-foreground">Créer</Text>
                        </Button>
                    </View>
                    <View>
                        {progsLoad ? (
                            <View className="flex-row">
                                <ProgsSkeletonList count={2} />
                            </View>
                        ) : progsError ? (
                            <Text className="text-foreground">Erreur lors du chargement des programmes</Text>
                        ) : (
                            <FlatList
                                showsHorizontalScrollIndicator={false}
                                data={progsData}
                                renderItem={({ item, index }: { item: Progs; index: number }) => (
                                    <ProgsCard data={item} isLoading={progsLoad} error={progsError} key={index} />
                                )}
                                keyExtractor={(item) => item.id.toString()}
                                contentContainerStyle={{ columnGap: 7 }}
                                horizontal
                            />
                        )}
                    </View>
                </View>
                <View className="my-3 flex-1">
                    <View className="flex flex-row items-center justify-between">
                        <Text className="text-xl font-semibold text-foreground">Exercices recommandés</Text>
                        <Button variant="ghost" onPress={() => router.push("/exos/showall")}>
                            <Text className="font-medium text-muted-foreground">Afficher tout</Text>
                        </Button>
                    </View>
                    <View>
                        {exosLoad ? (
                            <ExosSkeletonList count={2} />
                        ) : exosError ? (
                            <Text className="text-foreground">{exosError}</Text>
                        ) : (
                            exosData
                                ?.sort(() => Math.random() - 0.5)
                                .slice(0, 3)
                                .map((item: Exos, index: number) => (
                                    <View className="py-1" key={index}>
                                        <ExosCard data={item} isLoading={exosLoad} error={exosError} />
                                    </View>
                                ))
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
