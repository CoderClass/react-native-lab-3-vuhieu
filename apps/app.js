/**
 * Created by ken on 3/30/17.
 */
import React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    TextInput
} from 'react-native';

import MapView from 'react-native-maps';
import ImagePicker from 'react-native-image-picker';
var Lightbox = require('react-native-lightbox');
var SearchBar = require('react-native-search-bar');

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
                        latitude: 37.7616968,
                        longitude: -122.4225494,
                        name: "Demo",
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
                    image={require('./marker.png')}
                    key={index}
                    coordinate={location}
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
                                <Text>{location.name}</Text>
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
    };

    _searchYelp = (keyword) => {
        console.log("searching....")
        let currentLocation = this.state.locationsArr[0];
        const request = new Request(`https://api.yelp.com/v3/businesses/search?latitude=${currentLocation.latitude}&longitude=${currentLocation.longitude}&term=${this.state.keyword}`, {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer 3cRNmF8k-aE_vSGrIeE0BYFmSxXxcx1vA-3_cJA1W-zRZPf0I6Wy2ZY5D77d2QScP6B64nG0jndzU92PURmGJmUEWswp2SHwatipvoGzbKkdNpMWA3eUt_3UlmnXWHYx',
            })
        });

        try {
            fetch(request)
                .then((response) => response.json())
                .then((json) => {
                    console.log("Restaurant " + json.businesses.length);
                    var locations = [...this.state.locationsArr];
                    json.businesses.forEach(restaurant => {
                        locations.push({
                            latitude: restaurant.coordinates.latitude,
                            longitude: restaurant.coordinates.longitude,
                            image: {uri: restaurant.image_url},
                            name: restaurant.name,
                            address: restaurant.location.display_address[0] + " " + restaurant.location.display_address[1],
                        })
                    })
                    this.setState({
                        locationsArr: locations,
                    })
                })
        } catch (error) {
            console.log("Error " + error.message)
        }

    }

    render() {
        const region = {
            latitude: 37.7616968,
            longitude: -122.4225494,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        };
        console.log(this.state.location);

        return (
            <View
                style={{flex: 1,}}
            >
                <View
                    style={{marginTop: 30}}
                >
                    <SearchBar
                        onChangeText={(keyword) => {
                            this.setState({
                                keyword
                            })
                        }}
                        onSearchButtonPress={this._searchYelp}
                        ref='searchBar'
                        placeholder='Search'
                        enablesReturnKeyAutomatically={true}
                    />
                </View>
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
            </View>
        )
    }
}