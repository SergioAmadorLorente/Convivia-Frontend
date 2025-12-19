import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { COLORS, FONTS } from "../../styles/theme";
import { MaterialIcons } from "@expo/vector-icons";
interface UploadImageProps {
    label?: string;
    onImageSelected?: (uri: string | null) => void;
}
const UploadImage: React.FC<UploadImageProps> = ({
    label = "Subir imagen",
    onImageSelected,
}) => {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") return;
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });
        if (!result.canceled && result.assets?.length > 0) {
            const uri = result.assets[0].uri;
            setImageUri(uri);
            onImageSelected?.(uri);
        }
    };
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            {/* Mini vista previa opcional */}
            {imageUri && (
                <Image source={{ uri: imageUri }} style={styles.preview} />
            )}
            <TouchableOpacity style={styles.button} onPress={pickImage}>
                <MaterialIcons name="upload" size={28} color={COLORS.secondary} />
            </TouchableOpacity>


        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 18,
        paddingVertical: 14,
        backgroundColor: COLORS.background,
        borderRadius: 14,
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
        marginBottom: 12,
    },
    label: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: COLORS.secondary,
    },
    button: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: COLORS.inputBackground,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    preview: {
        width: 90,
        height: 90,
        borderRadius: 10,
        marginTop: 10,
        alignSelf: "flex-start",
    },
});
export default UploadImage;