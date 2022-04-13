import moment from 'moment';
import BridgeContainer from 'containers/bridge/BridgeContainer';
import classNames from 'classnames';
import Breadcrumb from 'components/BreadCrumb';
import urlMaker from 'helpers/urlMaker';
import InfoBox from 'components/InfoBox';
import ArrowRight from 'assets/images/arrowRight';
import minimizeAddress from 'helpers/minimizeAddress';
import humanizeAmount from 'helpers/humanizeAmount';
import useRequiredLogin from 'hooks/useRequiredLogin';
import { generateAddressURL, generateTransactionURL } from 'helpers/explorerURLGenerator';
import StatusLabel from '../StatusLabel';
import styles from './styles.module.scss';
import CExternalLink from '../../../../components/CExternalLink';
import { calculateFromAmount, calculateToAmount } from '../calculateFromAndToAmounts';

const SingleActivityDetails = ({ activityInfo }) => {
  useRequiredLogin(urlMaker.bridge.root());

  const breadCrumbData = [
    {
      name: 'My activities',
      url: urlMaker.bridge.activity.root(),
    }, {
      name: `${activityInfo.id}`,
    }];

  const singleActivityInfo = [
    {
      title: 'Status',
      render: () => <StatusLabel status={activityInfo.state} />,
    },
    {
      title: 'Order ID',
      render: () => `${activityInfo.id}`,
    },
    {
      title: 'Date',
      render: () => `${moment(activityInfo.created_at).fromNow()}`,
    },
    {
      title: 'Destination',
      render: () => (
        <CExternalLink
          href={generateAddressURL(activityInfo.user_destination)}
          content={minimizeAddress(activityInfo.user_destination.toUpperCase())}
        />
      ),
    },
    {
      title: 'Amount',
      render: () => (
        <div className={styles.amount}>
          {humanizeAmount(calculateFromAmount(activityInfo))} {activityInfo.from_asset.name}
          <ArrowRight />
          {humanizeAmount(calculateToAmount(activityInfo))} {activityInfo.to_asset.name}
        </div>
      ),
    },
    {
      title: 'Sending TX',
      render: () => (
        <CExternalLink
          href={generateTransactionURL(activityInfo.sending_tx)}
          content={minimizeAddress(activityInfo.sending_tx.toLowerCase(), 8)}
        />
      ),
    },
    {
      title: 'Receiving TX',
      render: () => (
        <CExternalLink
          href={generateTransactionURL(activityInfo.receiving_tx)}
          content={minimizeAddress(activityInfo.receiving_tx.toLowerCase(), 8)}
        />
      ),
    },
  ];

  return (
    <BridgeContainer title="Bridge Activity Detail | Lumenswap">
      <div className={classNames('layout main', styles.layout)}>
        <div className="row justify-content-center">
          <div className="col-xl-8 col-lg-10 col-md-11 col-sm-12 col-12">
            <Breadcrumb data={breadCrumbData} />

            <InfoBox
              data={activityInfo}
              rows={singleActivityInfo}
              className={styles.info}
            />
          </div>
        </div>
      </div>
    </BridgeContainer>
  );
};

export default SingleActivityDetails;
