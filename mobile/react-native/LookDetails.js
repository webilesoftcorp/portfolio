import React, { Component } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import autobind from 'autobind-decorator'
import styled from 'styled-components/native'
import { inject, observer } from 'mobx-react'
import Look from './Look'
import Items from './Items'
import StylitySlider from './StylitySlider'
import { getAllLooksItems } from 'app/domain/Looks/api';
import { Header } from '../../components'

import { getAllBrands } from 'app/domain/ItemOptions/api';

@inject(
  stores => ({
    setHeaderTitle: stores.UIStore.setHeaderTitle,
    setShowHeader: stores.UIStore.setShowHeader,
    addLook: stores.BasketStore.addLook,
    currentDiscoveryLook: stores.UIStore.currentDiscoveryLook,
  })
)
@observer
export default class LookDetails extends Component {

  static navigationOptions = {
    header: (props) => <Header {...props}/>
  }

  constructor(props) {
    super(props);

    this.state = {
      items: [],
      brands: [],
      lookIsExpanded: false
    };
  }

  @autobind scrollToEnd() {
    this.scrollView.scrollToEnd()
  }

  @autobind getTheLook() {
    const { navigation, addLook, currentDiscoveryLook: look } = this.props
    const { navigate } = navigation
    addLook(look)
    navigate('Basket')
  }

  async componentWillMount() {
    const response = await getAllBrands();

    if (response.success) {
      this.setState({ brands: response.data.brands });
    }
  }

  async componentDidMount() {
    const { navigation, setHeaderTitle, currentDiscoveryLook } = this.props
    const { success, data } = await getAllLooksItems(currentDiscoveryLook.id)
    setHeaderTitle(currentDiscoveryLook.name)

    if (success) {
      currentDiscoveryLook.setAllItems(data.itemsOfLook)
      const otherLooks = currentDiscoveryLook.otherLooks
      otherLooks.forEach(async (otherLook) => {
        const { success: otherSuccess, data: otherData } = await getAllLooksItems(otherLook.id)
        if(otherSuccess) {
          otherLook.setAllItems(otherData.itemsOfLook)
        }
      })
    }
  }

  expandLook = () => {
    const { setShowHeader } = this.props;
    setShowHeader(false);
    this.setState({ lookIsExpanded: true });
  };

  collapseLook = () => {
    const { setShowHeader } = this.props;
    setShowHeader(true);
    this.setState({ lookIsExpanded: false });
  };

  render() {
    const { navigation, currentDiscoveryLook: look } = this.props;
    const { lookIsExpanded } = this.state;

    return (
      <View style={styles.container}>
        <ScrollView
          style={{ alignSelf: 'stretch', marginTop: lookIsExpanded ? -10 : 0 }}
          ref={scrollView => {
            this.scrollView = scrollView
          }}
        >
          <Look
            look={look}
            expandLook={this.expandLook}
            lookIsExpanded={lookIsExpanded}
            collapseLook={this.collapseLook}
          />
          {
            !lookIsExpanded &&
            <Description>
              {look.items.length > 0 && (
                <Items
                  navigation={navigation}
                  items={look.items}
                  look={look}
                  brands={this.state.brands}
                  allItems={look.allItems}
                />
              )}
              <StylitySlider
                onButtonClick={this.scrollToEnd}
                onGetTheLook={this.getTheLook}
              />
            </Description>
          }
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  }
})
const Description = styled.View`
  padding-horizontal: 16px;
  margin-bottom: 16px;
`
