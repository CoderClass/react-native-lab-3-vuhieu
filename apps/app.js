/**
 * Created by ken on 3/30/17.
 */
import React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image
} from 'react-native';

import MapView from 'react-native-maps';
import ImagePicker from 'react-native-image-picker';
var Lightbox = require('react-native-lightbox');


export  default  class App extends Component {
    constructor() {
        super();
        this.state = {
            locationsArr: [],
            imageSize: {
                width: 30,
                height: 30,
            },
        }
    }

    componentWillMount() {
        this._getCurrentLocation();
    }

    _getCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            console.log('position', position);
            this.setState({
                locationsArr: [
                    {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }
                ]
            })
        }, (error) => {
            console.log('error', error);
        });
    }

    selectPhoto = (location) => {
        var options = {
            title: 'Select Picture',
            storageOptions: {
                skipBackup: true,
                path: 'images'
            }
        };

        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                let image = {uri: response.uri};
                location.image = image;
                let locations = [...this.state.locationsArr];
                locations.push(location)
                this.setState({
                    locationsArr: locations
                })

            }
        });
    }

    _renderMarkerView = () => {
        var result = [];
        this.state.locationsArr.forEach((location, index) => {
            result.push(
                <MapView.Marker
                    key={index}
                    coordinate={location}
                    title={'Current position'}
                >
                    <MapView.Callout>
                        <Lightbox
                            onOpen={() => this.setState({
                                imageSize: {
                                    width: 300,
                                    height: 300,
                                }
                            })}
                            onClose={() => this.setState({
                                imageSize: {
                                    width: 30,
                                    height: 30,
                                }
                            })}
                            navigator={this.props.navigator}>
                            <View
                                style={{justifyContent: 'center', alignItems: 'center'}}
                                >
                                <Image
                                    source={location.image}
                                    style={this.state.imageSize}
                                />
                            </View>
                        </Lightbox>
                    </MapView.Callout>
                </MapView.Marker>
            )
        });
        return result;
    }

    render() {
        const region = {
            latitude: 10.8231,
            longitude: 106.6297,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        };
        console.log(this.state.location);

        return (
            <MapView
                region={region}
                style={{flex: 1,}}
                onLongPress={(e) => {
                  const { coordinate } = e.nativeEvent;
                    this.selectPhoto(coordinate);
                    }}
            >
                {this._renderMarkerView()}
            </MapView>

        )
    }
}