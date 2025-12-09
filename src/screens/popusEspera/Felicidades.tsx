import React, { useState } from 'react';
import GLOBAL_STYLES from '../../styles/styles';
import Popup from '../../components/ui/Popup';

interface FelicidadesProps {
    visible?: boolean;
    onClose?: () => void;
}

const Felicidades: React.FC<FelicidadesProps> = ({ visible = true, onClose }) => {
    const [internalVisible, setInternalVisible] = useState(visible);

    const handleClose = () => {
        setInternalVisible(false);
        if (onClose) onClose();
    };

    return (
        <Popup
            visible={internalVisible}
            onClose={handleClose}
            imageType="happy"
            title="¡Felicidades!"
            titleStyle={GLOBAL_STYLES.popupTitle}
            description="Has completado la tarea dentro del plazo. Has ganado 25 puntos de Karma."
            descriptionStyle={GLOBAL_STYLES.subtitle}
            buttons={[
                {
                    text: 'Cerrar',
                    onPress: handleClose,
                    textStyle: GLOBAL_STYLES.textoBoton,
                },
            ]}
        />
    );
};

export default Felicidades;
