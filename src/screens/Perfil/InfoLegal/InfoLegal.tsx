import React from "react";
import { Text, View, ScrollView } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import GLOBAL_STYLES from "../../../styles/styles";
import Button from "../../../components/ui/Button";
import BottomBar from "../../../components/ui/BottomBar";
import { RootStackParamList } from "../../../navigation/RootStackParamList";

const InfoLegal: React.FC = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    return (
        <>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={GLOBAL_STYLES.container}>
                    <Text style={GLOBAL_STYLES.titulo}>Información Legal</Text>
                    <View style={{ marginTop: 30, width: "100%", alignItems: "center" }}>
                        <Button
                            style={GLOBAL_STYLES.buttonPrimaryGreen}
                            onPress={() => navigation.navigate("TerminosCondiciones")}
                        >
                            Términos y Condiciones de Uso
                        </Button>

                        <Button
                            style={GLOBAL_STYLES.buttonPrimaryGreen}
                            onPress={() => navigation.navigate("PoliticaCookiesPrivacidad")}
                        >
                            Política de Privacidad y Cookies
                        </Button>
                    </View>
                </View>
            </ScrollView>
            <BottomBar />
        </>
    );
};

export default InfoLegal;
