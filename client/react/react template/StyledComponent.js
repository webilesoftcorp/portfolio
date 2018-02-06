import React from 'react';
import PropTypes from 'prop-types';
import ImPropTypes from 'react-immutable-proptypes';
import styled from 'styled-components';
import { pure } from 'recompose';
import { map } from 'lodash/collection';

import Box from './Box';
import Form, { Row, Col } from './Form';
import { size } from 'styles/settings';

import Attributes, { types as attributesTypes } from './Attributes';
import Attribute from './Attribute';
import Avatar from './Avatar';
import Button from './SmallBlueButton';

import AddProfileImage from './AddProfileImage';

const CandidateMainInfoRoot = styled(Box)`
  && {
    & ${Row}:nth-child(1) {
      border-top: 0;
      border-bottom: 0;
      padding-bottom: 14px;
    }

    & ${Row}:nth-child(2) {
      padding-top: 0px;
    }

    padding-bottom: 100px;
    box-shadow: 0 1px 3px 0 rgba(63, 63, 68, 0.15),
      0 0 0 1px rgba(63, 63, 68, 0.05);
  }
`;

const Content = styled.div``;

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const ContentHeaderPrimaryCol = styled.div``;

const ContentHeaderSecondaryCol = styled.div``;

const Name = styled.p`
  line-height: 24px;
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  text-align: left;
  color: #637381;
  font-weight: bold;
  letter-spacing: 1px;
  font-family: LatoRegular;
`;

const Location = styled.p`
  font-family: LatoRegular;
  font-size: 14px;
  letter-spacing: 0.5px;
  color: #6f7e8b;
  margin: 0;
`;

const DayRate = styled.p`
  font-family: LatoRegular;
  font-size: 14px;
  letter-spacing: 0.5px;
  color: #6f7e8b;
  margin: 15px 0;
`;

const SimpleRow = styled.div`
  display: flex;
  align-items: center;
  padding: 0 0 0 20px;
`;

const SmallBorderRow = styled(Row)`
  padding: 0 20px !important;
`;

const Heading = styled.p`
  font-family: LatoBold;
  font-weight: 900;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.4px;
  color: #4a4a4a;
`;

const Experience = styled.p`
  font-family: LatoRegular;
  font-size: 14px;
  letter-spacing: 0.5px;
  color: #6f7e8b;
  margin: 15px 0 0 0;
`;


const Line = styled.div`
  width: 287px;
  height: 1px;
  background-color: #dfe3e8;
  margin: 15px 20px 0 20px;
`;

const CandidateViewMainInfo = ({ profile, openEditMode }) => (
  <CandidateMainInfoRoot>
    {profile.get('profileImage') ? (
      <Avatar
        src={profile.get('profileImage')}
        width={size.FULL}
        height={size.MD}
        styles={{ backgroundSize: 'cover' }}
      />
    ) : (
      <AddProfileImage onClick={openEditMode} />
    )}

    <Content>
      <Form vertical>
        <Row>
          <Col>
            <ContentHeader>
              <ContentHeaderPrimaryCol>
                <Name>
                  {profile.get('firstName')} {profile.get('lastName')}
                </Name>
              </ContentHeaderPrimaryCol>
              <ContentHeaderSecondaryCol>
                <Button width={29} onClick={openEditMode}>
                  Edit
                </Button>
              </ContentHeaderSecondaryCol>
            </ContentHeader>
          </Col>
        </Row>
        <SimpleRow>
          <Col>
            <Location>{profile.get('location')}</Location>
            <DayRate>Day rate: £{profile.get('dayRate')}</DayRate>
            <Experience>
              Experience: {profile.get('experience') || 0} years
            </Experience>
          </Col>
        </SimpleRow>
        <Line />
        <SmallBorderRow>
          <Heading>Skills:</Heading>
          <Attributes type={attributesTypes.SIMPLE}>
            {map(
              profile.get('skills') && profile.get('skills').toJS(),
              (skill, index) =>
                skill.name && (
                  <Attribute key={index} height={size.SM}>
                    {skill.name}
                  </Attribute>
                ),
            )}
          </Attributes>
        </SmallBorderRow>
        <SmallBorderRow>
          <Heading>Availability:</Heading>
          {profile.get('availability') && (
            <Attributes type={attributesTypes.SIMPLE}>
              <Attribute height={size.SM}>
                {(() => {
                  const availability = profile
                    .get('availability')
                    .toLowerCase();
                  return (
                    availability.charAt(0).toUpperCase() + availability.slice(1)
                  );
                })()}
              </Attribute>
            </Attributes>
          )}
        </SmallBorderRow>
      </Form>
    </Content>
  </CandidateMainInfoRoot>
);

CandidateViewMainInfo.propTypes = {
  profile: ImPropTypes.map.isRequired,
  openEditMode: PropTypes.func.isRequired,
};

export default pure(CandidateViewMainInfo);
