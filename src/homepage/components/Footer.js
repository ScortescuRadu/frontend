import React from 'react'
import Footer from '../../footer/footer'
import Icon from '../../footer/icons'

export function FooterContainer() {
    return (
        <Footer style={
          {
           border: '2px solid black'
          }}>
            <Footer.Wrapper>
            <Footer.Row>
            </Footer.Row>
            </Footer.Wrapper>
        </Footer>
    )
}