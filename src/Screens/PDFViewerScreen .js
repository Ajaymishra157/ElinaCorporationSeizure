import React from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import Pdf from 'react-native-pdf';
import Icon from 'react-native-vector-icons/FontAwesome';
import Share from 'react-native-share';
import colors from '../CommonFiles/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PDFViewerScreen = ({ route, navigation }) => {
    const { pdfUrl } = route.params;

    const handleShare = async () => {
        try {
            const localPath = pdfUrl.startsWith('file://') ? pdfUrl : 'file://' + pdfUrl;

            await Share.open({
                url: localPath,
                type: 'application/pdf',
                subject: 'Sharing PDF File',
            });
        } catch (error) {
            console.log('Error sharing PDF:', error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        top: 15,
                        left: 15,
                        width: '13%',
                    }}
                    onPress={() => {
                        navigation.goBack();
                    }}>
                    <Ionicons name="arrow-back" color="white" size={26} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>PDF Viewer</Text>


                <View
                    style={{
                        width: '15%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'absolute',
                        right: 6,
                        top: 16,

                    }}>

                    <TouchableOpacity onPress={handleShare}>
                        <Icon name="share" size={24} color="#fff" style={styles.icon} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* PDF Viewer */}
            <Pdf
                source={{ uri: pdfUrl, cache: true }}
                style={styles.pdf}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.Brown,
    },
    header: {
        height: 60,
        backgroundColor: colors.Brown, // Purple color
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 15,
        elevation: 4, // For Android shadow
        shadowColor: '#000', // For iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    icon: {
        marginHorizontal: 10,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    pdf: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height - 60, // To avoid overlap with header
    },
});

export default PDFViewerScreen;
