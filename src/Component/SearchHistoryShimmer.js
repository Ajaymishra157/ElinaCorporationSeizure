import React from 'react';
import { View } from 'react-native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const SearchHistoryShimmer = () => {
    const shimmerRows = Array.from({ length: 6 }).map((_, index) => (
        <View
            key={index}
            style={{
                marginTop: 10,
                backgroundColor: '#fff',
                padding: 5,
                marginBottom: 8,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#ccc', // Replace with colors.Brown if using constant
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 5,
                elevation: 3,
                height: 120
            }}
        >
            {/* Header Row */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 2,
                }}
            >
                <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: 40, height: 16, borderRadius: 4 }} />
                <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: 24, height: 24, borderRadius: 12 }} />
            </View>

            {/* Name & Reg No */}
            <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: '48%', height: 12, borderRadius: 4 }} />
                <View style={{ width: '4%' }} />
                <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: '48%', height: 12, borderRadius: 4 }} />
            </View>

            {/* Agg No & Date */}
            <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: '48%', height: 12, borderRadius: 4 }} />
                <View style={{ width: '4%' }} />
                <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: '48%', height: 12, borderRadius: 4 }} />
            </View>

            {/* Location */}
            <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: '80%', height: 12, borderRadius: 4 }} />
            </View>
        </View>
    ));

    return <>{shimmerRows}</>;
};

export default SearchHistoryShimmer;
