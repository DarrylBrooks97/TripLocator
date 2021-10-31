import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { useToast } from '@chakra-ui/toast';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import TripPortalFile from '../utils/TripPortal.json';
import {
	Box,
	Stack,
	Heading,
	Input,
	Center,
	Button,
	Flex,
	Grid,
	GridItem,
	Text,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalFooter,
	ModalBody,
	ModalHeader,
	ModalCloseButton,
	useDisclosure,
	Link,
} from '@chakra-ui/react';

export default function Home(): ReactJSXElement {
	const toast = useToast();
	const contractABI = TripPortalFile.abi;
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [connect, setConnect] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [account, setAccount] = useState<any>(null);
	const [allLocations, setAllLocations] = useState([]);
	const [location, setLocation] = useState<string>('');
	const [hashLink, setHashLink] = useState<string>('');

	const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum }: any = window;

			if (!ethereum) {
				console.log('Make sure you have metamask!');
				return;
			} else {
				console.log('We have the ethereum object', ethereum);
			}

			const accounts = await ethereum.request({ method: 'eth_accounts' });

			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log('Found an authorized account:', account);
				setAccount(account);
				setConnect(account);
			} else {
				console.log('No authorized account found');
			}
		} catch (error) {
			console.log(error);
		}
	};

	const connectWallet = async () => {
		try {
			const { ethereum }: any = window;

			if (!ethereum) {
				alert('Get MetaMask!');
				return;
			}

			const accounts = await ethereum.request({
				method: 'eth_requestAccounts',
			});

			console.log('Connected', accounts[0]);
			setAccount(accounts[0]);
		} catch (error) {
			console.log(error);
		}
	};

	const addTrip = async () => {
		if (location.length === 0 || location.length < 5) {
			toast({
				title: 'Error!',
				description: 'Must fill out form',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
			return;
		}
		try {
			const { ethereum }: any = window;
			const contractAddress =
				'0x90a331afdfB7d9A0382892bC6Ea34cD7CFcCf7B6';

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const tripPortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				const tripTxn = await tripPortalContract.addTrip(location, {
					gasLimit: 300000,
				});
				console.log('Mining...', tripTxn.hash);

				setLoading(true);
				await tripTxn.wait();
				console.log('Mined -- ', tripTxn.hash);
				onOpen();
				setHashLink('https://rinkeby.etherscan.io/tx/' + tripTxn.hash);
				setAllLocations(await tripPortalContract.getAllTrips());

				toast({
					title: 'Success!',
					description: 'Location was submitted',
					status: 'success',
					duration: 3000,
					isClosable: true,
				});
			} else {
				toast({
					title: 'Error!',
					description:
						'Please sign in and refesh before adding a trip',
					status: 'error',
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error: any) {
			console.log({ error });
			toast({
				title: 'Error!',
				description: `${error.reason}`,
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		}
		setLoading(false);
	};

	const getAllLocations = async () => {
		const contractAddress = '0x90a331afdfB7d9A0382892bC6Ea34cD7CFcCf7B6';
		try {
			const { ethereum }: any = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const tripPortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				/*
				 * Call the getAllWaves method from your Smart Contract
				 */
				const trips = await tripPortalContract.getAllTrips();

				/*
				 * We only need address, timestamp, and message in our UI so let's
				 * pick those out
				 */
				let tripsCleaned: any = [];
				trips.forEach((trip: any) => {
					tripsCleaned.push({
						creator: trip.creator,
						timestamp: new Date(trip.timestamp * 1000),
						location: trip.location,
					});
				});

				/*
				 * Store our data in React State
				 */
				setAllLocations(tripsCleaned);
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		checkIfWalletIsConnected();
		getAllLocations();
	}, []);

	return (
		<Box w="full" h="auto" position="relative" bgColor="#EEF0F2">
			{!connect ? (
				<Button
					position="absolute"
					borderRadius="25px"
					bg="#1C1C1C"
					top={10}
					right={10}
					onClick={connectWallet}
				>
					<Text color="white">Connect</Text>
				</Button>
			) : (
				<Box w="50px">
					<Button
						position="absolute"
						borderRadius="25px"
						bg="#1C1C1C"
						top={10}
						right={10}
					>
						<Text color="white" isTruncated>
							{account}
						</Text>
					</Button>
				</Box>
			)}
			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader color="green.500">Success</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						Congrats ! You sumbitted a location check out the
						transaction
						<Link href={hashLink} isExternal color="green.500">
							&nbsp;here
						</Link>
					</ModalBody>

					<ModalFooter>
						<Button colorScheme="blue" mr={3} onClick={onClose}>
							Close
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
			<Flex justifyContent="center" alignItems="center" pt="10%">
				<Stack w="80%" flexDirection="column" spacing={5}>
					<Center>
						<Heading color="black">Trip Adder</Heading>
					</Center>
					<Input
						placeholder="Enter a location"
						onChange={(e) => setLocation(e.target.value)}
					/>
					<Center>
						<Button
							variant="outline"
							onClick={addTrip}
							w={200}
							bg="facebook.400"
							isLoading={loading}
						>
							Submit
						</Button>
					</Center>
					<Center>
						<Grid templateColumns="repeat(3, 450px)" gap={3}>
							{allLocations.map((wave: any, index: number) => {
								return (
									<GridItem
										key={index}
										bgColor="rgba(28, 28, 28, 0.9)"
										mt={16}
										padding={8}
										borderRadius={20}
										transition="all .5s"
										position="relative"
										_hover={{
											transform: 'scale(1.1)',
										}}
									>
										<Text
											color="white"
											fontSize="md"
											fontWeight="bold"
											isTruncated
										>
											Creator: {wave.creator}
										</Text>
										<Text
											color="white"
											fontSize="md"
											fontWeight="bold"
											isTruncated
										>
											Time: {wave.timestamp.toString()}
										</Text>
										<Text
											color="white"
											fontSize="md"
											fontWeight="bold"
											isTruncated
										>
											Location: {wave.location}
										</Text>
									</GridItem>
								);
							})}
						</Grid>
					</Center>
				</Stack>
			</Flex>
		</Box>
	);
}
