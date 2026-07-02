import React from "react";
import { Text, View, ScrollView } from "react-native";
import { useTranslation } from 'react-i18next';
import GLOBAL_STYLES from "../../styles/styles";
import { Desplegable } from "../../components/ui";

const FAQ: React.FC = () => {
    const { t } = useTranslation();
    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: 1, backgroundColor: "#F5F4F2" }}
            showsVerticalScrollIndicator={false}
        >
            <Text style={GLOBAL_STYLES.titulo}>{t('faq.title')}</Text>

            <View style={GLOBAL_STYLES.container}>
                <View style={{ width: "85%", marginTop: 20 }}>
                    <Text style={[GLOBAL_STYLES.subtitle, { marginBottom: 12 }]}>
                        {t('faq.subtitle')}
                    </Text>

                    <Desplegable title={t('faq.q1')}>
                        <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
                            {t('faq.a1')}
                        </Text>
                    </Desplegable>

                    <Desplegable title={t('faq.q2')}>
                        <Text style={GLOBAL_STYLES.helperText}>
                            {t('faq.a2')}
                        </Text>
                    </Desplegable>

                    <Desplegable title={t('faq.q3')}>
                        <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
                            {t('faq.a3')}
                        </Text>
                    </Desplegable>

                    <Desplegable title={t('faq.q4')}>
                        <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
                            {t('faq.a4')}
                        </Text>
                    </Desplegable>

                    <Desplegable title={t('faq.q5')}>
                        <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
                            {t('faq.a5')}
                        </Text>
                    </Desplegable>
                </View>
            </View>
        </ScrollView>
    );
};

export default FAQ;
