import React from "react";
import { Text, View, ScrollView } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import GLOBAL_STYLES from "../../../styles/styles";
import Button from "../../../components/ui/Button";
import BottomBar from "../../../components/ui/BottomBar";
import { RootStackParamList } from "../../../navigation/RootStackParamList";

const InfoLegal: React.FC = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { t } = useTranslation();

    return (
        <>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, backgroundColor: "#F5F4F2" }}
                showsVerticalScrollIndicator={false}
            >
                <Text style={GLOBAL_STYLES.titulo}>{t('infoLegal.title')}</Text>

                <View style={GLOBAL_STYLES.container}>
                    <View style={{ marginTop: 30, width: "100%", alignItems: "center" }}>
                        <Button
                            style={GLOBAL_STYLES.buttonPrimaryGreen}
                            onPress={() => navigation.navigate("TerminosCondiciones")}
                        >
                            {t('infoLegal.termsButton')}
                        </Button>

                        <Button
                            style={GLOBAL_STYLES.buttonPrimaryGreen}
                            onPress={() => navigation.navigate("PoliticaCookiesPrivacidad")}
                        >
                            {t('infoLegal.privacyButton')}
                        </Button>
                    </View>
                    <Text style={{ marginTop: 150, width: "100%", marginRight: -300, bottom: 100, alignItems: "center", color: "green" }}>
                        {"v3.8.16"}
                    </Text>
                </View>
            </ScrollView>
            <BottomBar />
        </>
    );
};

export default InfoLegal;
