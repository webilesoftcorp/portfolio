import React, { Component } from 'react'
import { View, StyleSheet, Dimensions, Easing, Text, TouchableWithoutFeedback } from 'react-native'
import { observer, inject } from 'mobx-react'
import Carousel from 'react-native-snap-carousel'
import autobind from 'autobind-decorator'
import Mixpanel from 'react-native-mixpanel'

import config from '../../config'
// import { recommendedLooks } from '../../api'
import stores from 'app/stores';
import { getUserRecomendedLooks } from 'app/domain/User/api';
import AdjustableLook from './AdjustableLook'
import SeeMore from './SeeMore'
import UIStore from '../../stores/UIStore'


const horizontalMargin = 20
const slideWidth = 280

const sliderWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height
const itemWidth = slideWidth + horizontalMargin * 2

@inject(
  stores => ({
    currentCluster: stores.SessionStore.currentCluster,
    setCurrentCluster: stores.SessionStore.setCurrentCluster,
    currentStyle: stores.SessionStore.currentStyle,
    setCurrentStyle: stores.SessionStore.setCurrentStyle,
    setCurrentLookStylity: stores.UIStore.setCurrentLookStylity,
    setCurrentDiscoveryLook: stores.UIStore.setCurrentDiscoveryLook,
  })
)
@observer
export default class Looks extends Component {

  constructor(props) {
    super(props)
    this.state = {
      looks: [],
      selectedIndex: 0,
      currentCluster: 0,
    }
  }

  async componentDidMount() {
    const { UserStore } = stores;
    const response = await getUserRecomendedLooks(UserStore.userId);
    if (response.success) {
      this.setState({ looks: response.data.recommendedLooks.slice(0, 20) })
    }
  }

  @autobind nextCluster() {
    this.carousel.snapToItem(0, false)
    const { setCurrentCluster, currentCluster } = this.props
    setTimeout(() => {
      setCurrentCluster(currentCluster + 1)
    }, 500)
  }

  @autobind restartCluster() {
    this.carousel.snapToItem(0)
  }

  @autobind lookDetails(look) {
    const { navigate } = this.props.navigation
    Mixpanel.trackWithProperties('Open Look Details', { id: look.id })
    navigate('LookDetails', { look })
  }

  render() {
    const { width } = this.state
    const { clusters, currentCluster, setCurrentStyle, setCurrentLookStylity, setCurrentDiscoveryLook } = this.props
    return (
      <View style={styles.container}>
        <Carousel
          sliderWidth={sliderWidth}
          itemWidth={itemWidth}
          inactiveSlideScale={1}
          animationOptions={{ easing: Easing.linear}}
          ref={(carousel) => {
            this.carousel = carousel
            UIStore.carousel = carousel
          }}
          onSnapToItem = {slideIndex => {
            const look = clusters[currentCluster].looks[slideIndex]

            if (look) {
              setCurrentDiscoveryLook(look)
              setCurrentStyle(slideIndex)
              this.setState({ selectedIndex: slideIndex })
            }
          }}
        >
          {clusters.length > 0 && clusters[currentCluster].looks.map((look, i) => (
            <TouchableWithoutFeedback onPress={() => this.lookDetails(look)} key={look.id}>
              <View style={styles.slide}>
                {i >= this.state.selectedIndex - 1 && i <= this.state.selectedIndex + 1 ? (
                  <AdjustableLook
                    look={look}
                    width={width}
                    height={screenHeight - 350 - 80}
                    isCurrent={i === this.state.selectedIndex}
                  />
                ) : <View style={{ width, height: screenHeight - 350 - 80 }} />}
                <View style={styles.description}>
                  <Text style={styles.big}>{look.name} </Text>
                  <Text style={styles.small}>from £{look.price}</Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          ))}
          <SeeMore
            onNextCategory={this.nextCluster}
            isLast={currentCluster === clusters.length - 1}
            onRestart={this.restartCluster}
          />
        </Carousel>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 15,
  },
  description: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#e1e1e1',
    height: 80,
    padding: 15,
    justifyContent: 'space-between'
  },
  big: {
    fontSize: 20,
    color: '#685757',
    fontFamily: 'GTWalsheim',
    textAlign: 'center',
    height: 25,
  },
  small: {
    fontSize: 14,
    color: '#878787',
    fontFamily: 'GTWalsheim',
    textAlign: 'center',
    marginTop: 8,
  },
  slide: {
    width: itemWidth,
    height: screenHeight - 350,
    paddingHorizontal: 10,
  },
})
