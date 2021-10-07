import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import BN from 'helpers/BN';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import CSelectToken from 'components/CSelectToken';
import defaultTokens from 'tokens/defaultTokens';
import Button from 'components/Button';
import LiquidityInput from 'components/LiquidityInput';
import AMMCurrentPrice from 'components/AMMCurrentPrice';
import { closeModalAction, openModalAction } from 'actions/modal';
import isSameAsset from 'helpers/isSameAsset';
import ConfirmLiquidity from 'blocks/ConfirmLiquidity';
import numeral from 'numeral';
import AMMPriceInput from 'components/AMMPriceInput';
import getAssetDetails from 'helpers/getAssetDetails';
import styles from './styles.module.scss';

const setLabel = (name, src) => (
  <div className="d-flex align-items-center">
    <Image src={src} width={20} height={20} alt={name} />
    <span className="ml-2">{name}</span>
  </div>
);

const AddLiquidity = ({ tokenA, tokenB, selectAsset }) => {
  const userBalance = useSelector((state) => state.userBalance);

  const xlm = defaultTokens.find((i) => i.code === 'XLM');
  const lsp = defaultTokens.find((i) => i.code === 'LSP');
  const defaultTokensData = {
    tokenA: {
      ...xlm,
      balance:
      numeral(userBalance.find((balance) => isSameAsset(
        balance.asset, getAssetDetails(xlm),
      ))?.balance).format('0,0.[0000000]')
        ?? 0,
    },
    tokenB: {
      ...lsp,
      balance:
      numeral(userBalance.find((balance) => isSameAsset(
        balance.asset, getAssetDetails(lsp),
      ))?.balance).format('0,0.[0000000]')
       ?? 0,
    },
  };
  let mainTokenA = { ...tokenA?.details, logo: tokenA?.logo, balance: tokenA?.balance };
  let mainTokenB = { ...tokenB?.details, logo: tokenB?.logo, balance: tokenB?.balance };
  if (!tokenA) {
    mainTokenA = defaultTokensData.tokenA;
  }
  if (!tokenB) {
    mainTokenB = defaultTokensData.tokenB;
  }

  const dispatch = useDispatch();
  const {
    handleSubmit,
    control,
    formState,
    errors,
    trigger,
    getValues,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      asset1MaxPrice: 1,
      asset1MinPrice: 0,
    },
  });

  const onSubmit = (data) => {
    console.log(data);
    dispatch(closeModalAction());
    const confirmData = {
      tokenA: {
        logo: mainTokenA.logo,
        code: mainTokenA.code,
        balance: data.AmountTokenA,
      },
      tokenB: {
        logo: mainTokenB.logo,
        code: mainTokenB.code,
        balance: data.AmountTokenB,
      },
    };
    dispatch(closeModalAction());
    dispatch(
      openModalAction({
        modalProps: {
          title: 'Deposit Liquidity Confirm',
          className: 'main',
        },
        content: <ConfirmLiquidity
          data={confirmData}
        />,
      }),
    );
  };

  const currentCurrency = {
    pair1: { value: '14', currency: mainTokenA.code },
    pair2: { value: '1', currency: mainTokenB.code },
  };
  useEffect(() => {
    trigger();
  }, []);
  useEffect(() => {
    trigger();
  }, [JSON.stringify(getValues())]);

  function errorGenerator() {
    for (const error of Object.values(errors)) {
      if (error.message) {
        return error.message;
      }
    }
    return 'Create';
  }

  const handleSelectAsset = (token) => {
    function onTokenSelect(asset) {
      selectAsset(token, asset);
    }
    dispatch(
      openModalAction({
        modalProps: {
          title: 'New pool',
          className: 'main',
        },
        content: <CSelectToken onTokenSelect={onTokenSelect} />,
      }),
    );
  };
  const validateAmountTokenA = (value) => {
    if (new BN(0).gt(value)) {
      return 'Amount is not valid';
    }
    if (new BN(value).gt(mainTokenA.balance)) {
      return 'Insufficient balance';
    }
    return true;
  };
  const validateAmountTokenB = (value) => {
    if (new BN(0).gt(value)) {
      return 'Amount is not valid';
    }
    if (new BN(value).gt(mainTokenB.balance)) {
      return 'Insufficient balance';
    }
    return true;
  };

  const validateMinPrice = (value) => {
    if (value < 0) {
      return 'Min price is not valid';
    }
    if (new BN(value).gt(getValues('asset1MaxPrice')) || value === getValues('asset1MaxPrice')) {
      return 'Max price should be bigger';
    }
    return true;
  };

  const validateMaxPrice = (value) => {
    if (value < 0) {
      return 'Max price is not valid';
    }
    if (new BN(getValues('asset1MaxPrice')).gt(value) || value === getValues('asset1MinPrice')) {
      return 'Max price should be bigger';
    }
    return true;
  };

  return (
    <div className="pb-4">
      <h6 className={styles.label}>Select pair</h6>
      <div className="d-flex justify-content-between">
        <div className={styles.select} onClick={() => handleSelectAsset('tokenA')}>
          {setLabel(mainTokenA.code, mainTokenA.logo)}
          <span className="icon-angle-down" />
        </div>
        <div className={styles.select} onClick={() => handleSelectAsset('tokenB')}>
          {setLabel(mainTokenB.code, mainTokenB.logo)}
          <span className="icon-angle-down" />
        </div>
      </div>

      <div className={styles.current}><AMMCurrentPrice pairs={currentCurrency} /></div>

      <hr className={styles.hr} />

      <h6 className={styles.label}>Deposit liquidity</h6>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="AmountTokenA"
          control={control}
          rules={{
            required: 'Amount is required',
            validate: validateAmountTokenA,
          }}
          render={(props) => (
            <LiquidityInput
              balance={`${numeral(mainTokenA.balance).format('0,0.[0000000]')} ${mainTokenA.code}`}
              currency={mainTokenA.code}
              onChange={props.onChange}
              value={props.value}
              currencySrc={mainTokenA.logo}
            />
          )}
        />
        <Controller
          name="AmountTokenB"
          control={control}
          rules={{
            required: 'Amount is required',
            validate: validateAmountTokenB,
          }}
          render={(props) => (
            <LiquidityInput
              onChange={props.onChange}
              value={props.value}
              balance={`${numeral(mainTokenB.balance).format('0,0.[0000000]')} ${mainTokenB.code}`}
              currency={mainTokenB.code}
              currencySrc={mainTokenB.logo}
              className="mt-3"
            />
          )}
        />
        <div className={styles['footer-inputs-container']}>
          <Controller
            name="asset1MinPrice"
            control={control}
            rules={{
              validate: validateMinPrice,
            }}
            render={(props) => (
              <AMMPriceInput
                onChange={props.onChange}
                value={props.value}
                defaultValue={0}
                token={mainTokenA}
                type="Min"
              />
            )}
          />
          <Controller
            name="asset1MaxPrice"
            control={control}
            rules={{
              validate: validateMaxPrice,
            }}
            render={(props) => (
              <AMMPriceInput
                onChange={props.onChange}
                value={props.value}
                defaultValue={1}
                token={mainTokenA}
                type="Max"
              />
            )}
          />
        </div>

        <Button
          htmlType="submit"
          variant="primary"
          content={errorGenerator()}
          fontWeight={500}
          className={styles.btn}
          disabled={!formState.isValid || formState.isValidating}
        />
      </form>
    </div>
  );
};

export default AddLiquidity;
