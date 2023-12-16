import { Box, Container, HStack, VStack,Text, Badge } from '@chakra-ui/layout'
import React from 'react'
import Loader from './Loader';
import { useEffect,useState } from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {server} from "../index"
import ErrorComponent from './ErrorComponent';
import { Radio, RadioGroup } from '@chakra-ui/radio';
import { Date } from 'globalthis/implementation';
import { Image } from '@chakra-ui/image';
import { Stat, StatArrow, StatHelpText, StatLabel, StatNumber } from '@chakra-ui/stat';
import { Progress } from '@chakra-ui/progress';
import Chart from "./Chart"
import { Button } from '@chakra-ui/button';

const CoinDetails = () => 
{
  const [coin, setCoin] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currency, setCurrency] = useState("inr"); 
  const [days, setDays] = useState("24h");
  const [chartArray, setChartArray] = useState([]);
  const params = useParams();
  const currencySymbol = currency === "inr" ? "₹" : currency === "eur" ? "€" : "$";
  const btns = ["24h", "7d", "14d", "30d", "60d", "200d", "1y", "max"];

  const switchChartStats = (key) => {
    switch (key) {
      case "24h":
        setDays("24h");
        if(days!==key)
          setLoading(true);
        break;
      case "7d":
        setDays("7d");
        if(days!==key)
          setLoading(true);
        break;
      case "14d":
        setDays("14d");
        if(days!==key)
          setLoading(true);
        break;
      case "30d":
        setDays("30d");
        if(days!==key)
          setLoading(true);        
        break;
      case "60d":
        setDays("60d");
        if(days!==key)
          setLoading(true);
        break;
      case "200d":
        setDays("200d");
        if(days!==key)
          setLoading(true);
        break;
      case "1y":
        setDays("365d");
        if(days!=="365d")
          setLoading(true);
        break;
      case "max":
        setDays("max");
        if(days!==key)
          setLoading(true);
        break;

      default:
        setDays("24h");
        setLoading(true);
        break;
    }
  };

  useEffect(() => 
  {
    const fetchCoins = async () => 
    {
      try { 
        const { data } = await axios.get(`${server}/coins/${params.id}`);
        const { data: chartData } = await axios.get(
          `${server}/coins/${params.id}/market_chart?vs_currency=${currency}&days=${days}`
        );
        setCoin(data);
        setChartArray(chartData.prices);
        setLoading(false);
      } 
      catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchCoins();
  }, [params.id,currency, days]);

  if (error) 
  {
    return <ErrorComponent message={"Error while fetching data"} />;
  }
  return (
    <Container maxW="container.xl">
      {
      loading?(<Loader/>):
      (
        <>
        <Box width={"full"} borderWidth={1}>
        <Chart arr={chartArray} currency={currencySymbol} days={days} />
        </Box>
        <HStack p="4" overflowX={"auto"}>
            {btns.map((i) => (
              <Button
                disabled={days === i}
                key={i}
                onClick={() => switchChartStats(i)}
              >
                {i}
              </Button>
            ))}
          </HStack>
        <RadioGroup value={currency} onChange={setCurrency} p ={"8"}>
            <HStack spacing={"4"}>
              <Radio value="inr">INR</Radio>
              <Radio value="eur">EUR</Radio>
              <Radio value="usd">USD</Radio>
            </HStack>
        </RadioGroup>
        <VStack spacing="4" p="16" alignItems= "flex-start" >
          <Text fontSize="small" alignSelf="center" opacity={0.7}>
            Last updated on {Date(coin.market_data.last_updated).split("G")[0]}
          </Text>
          <Image
            src={coin.image.large}
            w="16"
            h="16"
            objectFit="contain"
          />
          <Stat>
            <StatLabel>{coin.name}</StatLabel>
            <StatNumber>{currencySymbol}{coin.market_data.current_price[currency]}</StatNumber>
            <StatHelpText>
              <StatArrow type={coin.market_data.price_change_percentage_24h > 0?
              "increase":
              "decrease"}/>
              {coin.market_data.price_change_percentage_24h}%
            </StatHelpText>
          </Stat>
          <Badge fontSize="2xl" color="white" bgColor="blackAlpha.900">
          #{coin.market_cap_rank}
          </Badge>
          <CustomBar high ={`${currencySymbol}${coin.market_data.high_24h[currency]}`} low={`${currencySymbol}${coin.market_data.low_24h[currency]}`} let prog={(coin.market_data.current_price[currency]-coin.market_data.low_24h[currency])/(coin.market_data.high_24h[currency]-coin.market_data.low_24h[currency])*100}/>
          <Box w="full" p="4" >
            <Item title={"MAX SUPPLY"} value={coin.market_data.max_supply}/>
            <Item title={"CIRCULATING SUPPLY"} value={coin.market_data.circulating_supply}/>
            <Item title={"MARKET CAP"} value={`${currencySymbol}${coin.market_data.market_cap[currency]}`}/>
            <Item title={"ALL TIME HIGH"} value={`${currencySymbol}${coin.market_data.ath[currency]}`}/>
            <Item title={"ALL TIME LOW"} value={`${currencySymbol}${coin.market_data.atl[currency]}`}/>
          </Box>
        </VStack>
        </> 
      )
      }
    </Container>
      
  )
};

const Item=({title,value})=>(
  <HStack justifyContent="space-between" w="full" my="4">
    <Text fontFamily="" letterSpacing="widest">{title}</Text>
    <Text>{value}</Text>
  </HStack>
)
const CustomBar = ({high,low,prog})=>(
  <VStack w="full">
    <Progress value= {prog} colorScheme={"blue"} w={"full"}/>
    <HStack justifyContent="space-between" w="full">
      <Badge children={low} colorScheme="red"/>
      <Badge children={high} colorScheme="green"/>
    </HStack>
  </VStack>
)

export default CoinDetails