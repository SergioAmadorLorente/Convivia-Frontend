import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Dimensions,
} from "react-native";
import ImageViewing from "react-native-image-viewing";
import * as ImagePicker from "expo-image-picker";
import { COLORS, FONTS } from "../../styles/theme";
import { MaterialIcons } from "@expo/vector-icons";
interface UploadImageProps {
    label?: string;
    onImageSelected?: (uri: string | null) => void;
    editable?: boolean; // true = modo edición, false = modo estático
    initialImageUri?: string | null; // URI de la imagen inicial para precargar
}

const { width, height } = Dimensions.get("window");

const formatUri = (uri: string | null): string | null => {
    if (!uri) return null;
    let clean = uri;
    if (clean.startsWith("data:")) {
        if (clean.startsWith("data:application/octet-stream") || clean.startsWith("data:;")) {
            clean = clean.replace(/^data:(application\/octet-stream|);?/, "data:image/jpeg;");
        }
        clean = clean.replace(/;;+/g, ";");
    }
    return clean;
};

const UploadImage: React.FC<UploadImageProps> = ({
    label = "Subir imagen",
    onImageSelected,
    editable = true,
    initialImageUri = null,
}) => {
    const [imageUri, setImageUri] = useState<string | null>(formatUri(initialImageUri));
    const [expanded, setExpanded] = useState<boolean>(!editable && !!initialImageUri);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const showLabel = !imageUri || expanded;

    // Efecto para actualizar la imagen cuando cambia initialImageUri
    useEffect(() => {
        const formatted = formatUri(initialImageUri);
        setImageUri(formatted);
        if (formatted && !editable) {
            setExpanded(true);
        }
    }, [initialImageUri, editable]);

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
    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") return;
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });
        if (!result.canceled && result.assets?.length > 0) {
            const uri = result.assets[0].uri;
            setImageUri(uri);
            onImageSelected?.(uri);
        }
    };

    const deleteImage = () => {
        setImageUri(null);
        setExpanded(false);
        onImageSelected?.(null);
    };

    return (
        <View style={styles.container}>
            {/* Cabecera siempre visible con Botones y Arrow */}
            <View style={styles.header}>
                <View style={[styles.headerContent, { flex: 1 }]}>
                    {/* Mostrar label cuando no hay imagen o cuando está expandido; si no, mostrar miniatura tocable */}
                    {showLabel ? (
                        <Text style={styles.label}>{label}</Text>
                    ) : (
                        
                        <TouchableOpacity onPress={() => setExpanded(true)}>
                            <Image source={{ uri: imageUri! }} style={styles.imagePreview} />
                        </TouchableOpacity>
                    )}

                    {imageUri && editable && (
                        <MaterialIcons name="check-circle" size={18} color={COLORS.primary} style={styles.checkIcon} />
                    )}
                </View>

                {/* Botones de acción siempre visibles en la cabecera */}
                {editable && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
                            <MaterialIcons name="photo-camera" size={24} color={COLORS.secondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
                            <MaterialIcons name="upload" size={24} color={COLORS.secondary} />
                        </TouchableOpacity>
                        {/* Flecha para expandir/colapsar (solo si hay imagen para ver en grande) */}
                        {imageUri && (
                            <TouchableOpacity onPress={() => setExpanded(!expanded)} style={{ marginLeft: 5 }}>
                                <MaterialIcons 
                                    name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                                    size={24} 
                                    color={COLORS.secondary} 
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                
                {/* En modo estático, solo mostrar flecha si hay imagen */}
                {!editable && imageUri && (
                    <TouchableOpacity onPress={() => setExpanded(!expanded)} style={{ marginLeft: 5 }}>
                        <MaterialIcons 
                            name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                            size={24} 
                            color={COLORS.secondary} 
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Contenido Expandido: Imagen en Grande (dentro de la card) */}
            {expanded && imageUri && (
                <View style={styles.content}>
                     <TouchableOpacity 
                        style={styles.previewContainer} 
                        onPress={() => setIsModalVisible(true)}
                        activeOpacity={0.85}
                     >
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.preview}
                            resizeMode="cover"
                            fadeDuration={0}
                        />
                        <View style={styles.zoomBadge}>
                            <MaterialIcons name="zoom-in" size={18} color="#FFF" />
                            <Text style={styles.zoomBadgeText}>Ampliar</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Botones de editar y eliminar */}
                    {editable && (
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.deleteButton} onPress={deleteImage}>
                                <MaterialIcons name="delete" size={20} color="#FFF" />
                                <Text style={styles.buttonText}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            <ImageViewing
                images={imageUri ? [{ uri: imageUri }] : []}
                imageIndex={0}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
                swipeToCloseEnabled={true}
                doubleTapToZoomEnabled={true}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        width: "100%",
        backgroundColor: COLORS.background,
        borderRadius: 14,
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
        marginBottom: 12,
    },
    checkIcon: {
        marginLeft: 8,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 18,
        paddingVertical: 14,
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.inputBackground,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
    },
    label: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: COLORS.secondary,
    },
    content: {
        paddingHorizontal: 18,
        paddingBottom: 20,
        backgroundColor: COLORS.background,
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
    },
    previewContainer: {
        marginTop: 0,
        alignSelf: "stretch",
        width: "100%",
        height: 220,
        position: "relative",
    },
    preview: {
        width: "100%",
        height: 220,
        borderRadius: 12,
    },
    zoomBadge: {
        position: "absolute",
        bottom: 10,
        right: 10,
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    zoomBadgeText: {
        color: "#FFF",
        fontSize: 12,
        fontFamily: FONTS.bold,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.9)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalCloseArea: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    fullScreenImage: {
        width: width,
        height: height * 0.8,
    },
    closeButton: {
        position: "absolute",
        top: 50,
        right: 20,
        padding: 10,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 25,
    },
    imagePreview: {
        width: 44,
        height: 44,
        borderRadius: 8,
        resizeMode: "cover",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
        gap: 12,
    },
    editButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    deleteButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E74C3C",
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    buttonText: {
        color: "#FFF",
        fontSize: 15,
        fontFamily: FONTS.bold,
    },
});
export default UploadImage;