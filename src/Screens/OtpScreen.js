import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import colors from '../CommonFiles/Colors';
import { ENDPOINTS } from '../CommonFiles/Constant';
import Ionicons from 'react-native-vector-icons/Ionicons';

const OtpScreen = ({ route, navigation }) => {
    const phoneNumber = route?.params?.mobile || '';
    const maskedPhone = phoneNumber.replace(/(\d{2})\d{4}(\d{4})/, '$1XXXX$2');

    const [otp, setOtp] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(''); // For empty OTP error

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalSuccess, setModalSuccess] = useState(false);

    // Resend OTP states
    const [timer, setTimer] = useState(0);
    const [isResendDisabled, setIsResendDisabled] = useState(false);

    const inputRefs = useRef([]);
    const intervalRef = useRef(null);

    // 🔄 Timer effect
    useEffect(() => {
        if (timer > 0) {
            intervalRef.current = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
            setIsResendDisabled(false);
        }

        return () => clearInterval(intervalRef.current);
    }, [timer]);

    const handleOtpChange = (text, index) => {
        const digit = text.replace(/[^0-9]/g, '');
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        if (digit && index < 3) inputRefs.current[index + 1].focus();
        if (error) setError('');
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerifyOtp = async () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length !== 4) {
            setError('OTP is Required');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(ENDPOINTS.otp_verify, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ staff_mobile: phoneNumber, otp: enteredOtp }),
            });

            if (!response.ok) throw new Error('Network error');

            const data = await response.json();

            if (data?.status === "True" && data?.code === 200) {
                // Success
                setModalMessage(data.message || 'OTP Verified Successfully!');
                setModalSuccess(true);
                setModalVisible(true);
            } else {
                // Failed
                setModalMessage(data.message || 'Please try again');
                setModalSuccess(false);
                setModalVisible(true);
            }
        } catch (err) {
            setModalMessage('Network error. Please try again.');
            setModalSuccess(false);
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsResendDisabled(true);
        setTimer(30); // 30 sec timer

        try {
            const response = await fetch(ENDPOINTS.otp_resend, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ staff_mobile: phoneNumber }),
            });

            const data = await response.json();


        } catch (err) {

        }
    };


    const handleModalOk = () => {
        setModalVisible(false);
        if (modalSuccess) {
            // Only on success, go back to login
            navigation.pop(2);
        }
    };

    return (
        <View style={styles.container}>
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
                <Ionicons name="arrow-back" color="black" size={26} />
            </TouchableOpacity>

            <View style={styles.header}>

                <Text style={styles.headerText}>Please Enter 4-digit Code</Text>
            </View>

            <View style={styles.instruction}>
                <Text style={styles.instructionText}>
                    Enter the 4-digit code sent to {'\n'}{maskedPhone}
                </Text>
            </View>

            <View style={styles.otpContainer}>
                {Array(4).fill(0).map((_, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => inputRefs.current[index] = ref}
                        style={[
                            styles.otpInput,
                            { borderColor: otp[index] || !error ? '#dddddd' : '#FF0000' }
                        ]}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={otp[index]}
                        onChangeText={(text) => handleOtpChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                    />
                ))}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyOtp} disabled={loading}>
                {loading ? <ActivityIndicator size="small" color="#fff" /> :
                    <Text style={styles.verifyButtonText}>VERIFY OTP</Text>}
            </TouchableOpacity>


            {/* Resend OTP */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, alignItems: 'center' }}>
                <Text style={{ color: '#666', fontSize: 16, fontFamily: 'Inter-Medium' }}>
                    Didn't get OTP?{' '}
                </Text>

                {isResendDisabled ? (
                    <Text
                        style={{
                            color: '#999', // grey color for disabled
                            fontSize: 16,
                            fontWeight: 'bold',
                            fontFamily: 'Inter-Medium',
                            opacity: 0.7, // thoda fade effect
                        }}
                    >
                        Resend in {timer}s
                    </Text>

                ) : (
                    <TouchableOpacity
                        onPress={handleResendOtp}
                        disabled={isResendDisabled} // true hone par click disable
                        style={{
                            opacity: isResendDisabled ? 0.5 : 1, // visually dim
                        }}
                    >
                        <Text style={{
                            color: isResendDisabled ? '#999' : colors.Brown,
                            fontSize: 16,
                            fontWeight: 'bold',
                            fontFamily: 'Inter-Medium'
                        }}>
                            Resend OTP
                        </Text>
                    </TouchableOpacity>

                )}
            </View>




            {/* Modal */}
            <Modal visible={modalVisible} transparent
                animationType="fade"
                onRequestClose={() => { setModalVisible(false); }}>
                <TouchableOpacity
                    style={styles.modalBackground}
                    activeOpacity={1}

                    onPress={() => setModalVisible(false)} // बाहर क्लिक करने पर बंद होगा
                >
                    <View style={styles.modalContainer} onStartShouldSetResponder={() => true}
                        onTouchEnd={e => e.stopPropagation()}>
                        <View style={styles.modalContainer}>
                            <Text style={[styles.modalSuccessText, { color: modalSuccess ? '#4CAF50' : 'red' }]}>
                                {modalSuccess ? 'Success!' : 'Failed'}
                            </Text>
                            <Text style={styles.modalMessage}>{modalMessage}</Text>
                            <TouchableOpacity style={styles.modalButton} onPress={handleModalOk}>
                                <Text style={styles.modalButtonText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default OtpScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
    header: { marginTop: 60, marginBottom: 40 },
    headerText: { fontSize: 24, fontWeight: 'bold', color: colors.light_brown, fontFamily: 'Inter-Bold' },
    instruction: { alignItems: 'center', marginBottom: 20 },
    instructionText: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24, fontFamily: 'Inter-Regular' },
    otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    otpInput: { width: 50, height: 50, borderWidth: 1, borderRadius: 8, textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#333', backgroundColor: '#fff', fontFamily: 'Inter-Medium' },
    verifyButton: { backgroundColor: colors.Brown, paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    verifyButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', fontFamily: 'Inter-Bold' },
    errorText: { color: 'red', fontSize: 14, textAlign: 'center', marginBottom: 10 },
    modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center' },
    modalSuccessText: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, fontFamily: 'Inter-Regular' },
    modalMessage: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20, fontFamily: 'Inter-Regular' },
    modalButton: { backgroundColor: colors.Brown, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 30 },
    modalButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', fontFamily: 'Inter-Regular' },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: '80%',
        // Modal को बाहर के क्लिक से बचाने के लिए
    },

});
