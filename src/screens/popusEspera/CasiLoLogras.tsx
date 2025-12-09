import React, { useState } from 'react';
import GLOBAL_STYLES from '../../styles/styles';
import Popup from '../../components/ui/Popup';

interface CasiLoLograsProps {
    visible?: boolean;
    onClose?: () => void;
}

const CasiLoLogras: React.FC<CasiLoLograsProps> = ({ visible = true, onClose }) => {
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
            title="¡Casi lo logras!"
            titleStyle={GLOBAL_STYLES.popupTitle}
            description="La próxima vez, intenta completar la tarea dentro del plazo. Has ganado 0 puntos de Karma."
            descriptionStyle={GLOBAL_STYLES.subtitle}
            buttons={[
                {
                    text: 'Aceptar',
                    onPress: handleClose,
                    textStyle: GLOBAL_STYLES.textoBoton,
                },
            ]}
        />
    );
};

export default CasiLoLogras;
