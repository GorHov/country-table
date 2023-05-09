import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CountryTable.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

type Country = {
    name: string;
    region: string;
    population: number;
    area: number;
    flags: {
        png: string;
    };
};

const regions = [
    'Africa',
    'Europe',
    'Asia',
    'Oceania',
    'Australia',
    'North America',
    'South America',
];

const CountryTable: React.FC = () => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
    const [searchText, setSearchText] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [sortType, setSortType] = useState<'population' | 'area' | ''>('');

    useEffect(() => {
        axios
            .get('https://restcountries.com/v2/all?fields=name,region,population,area,flags')
            .then((response) => {
                const countriesData = response.data.slice(0, 41);
                setCountries(countriesData);
            })
            .catch((error) => {
                console.error('Error fetching countries:', error);
            });
    }, []);

    useEffect(() => {
        let filtered = countries;
        if (searchText) {
            filtered = filtered.filter((country) =>
                country.name.toLowerCase().includes(searchText.toLowerCase())
            );
        }
        if (selectedRegion) {
            filtered = filtered.filter((country) => country.region === selectedRegion);
        }

        // Remove Azerbaijan
        filtered = filtered.filter((country) => country.name !== 'Azerbaijan');

        // Sorting logic
        switch (sortType) {
            case 'population':
                filtered = filtered.sort((a, b) => a.population - b.population);
                break;
            case 'area':
                filtered = filtered.sort((a, b) => a.area - b.area);
                break;
            default:
                break;
        }

        setFilteredCountries(filtered);
    }, [countries, searchText, selectedRegion, sortType]);


    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
        setCurrentPage(1);
    };

    const handleRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRegion(event.target.value);
        setCurrentPage(1);
    };

    const handleRemoveCountry = (name: string) => {
        setFilteredCountries((prevCountries) =>
            prevCountries.filter((country) => country.name !== name)
        );
    };

    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSortType(event.target.value as 'population' | 'area' | '');
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCountries.slice(indexOfFirstItem, indexOfLastItem);

    const renderPagination = () => {
        const pageNumbers = Math.ceil(filteredCountries.length / itemsPerPage);

        if (pageNumbers <= 1) {
            return null;
        }

        return (
            <div>
                {Array.from({ length: pageNumbers }).map((_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`m-1 btn ${currentPage === index + 1 ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="container">
            <div className="search-container">
                <div className="d-flex">
                    <div className="col-md-2 mb-2 p-2">
                        <input
                            type="text"
                            placeholder="Search by country name"
                            value={searchText}
                            onChange={handleSearchChange}
                            className="form-control"
                        />
                    </div>
                    <div className="col-md-2 mb-2 p-2">
                        <select
                            value={selectedRegion}
                            onChange={handleRegionChange}
                            className="form-select"
                        >
                            <option value="">All Regions</option>
                            {regions.map((region) => (
                                <option key={region} value={region}>
                                    {region}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-2 mb-2 p-2">
                        <select
                            value={sortType}
                            onChange={handleSortChange}
                            className="form-select"
                        >
                            <option value="">Sort by</option>
                            <option value="population">Population</option>
                            <option value="area">Area</option>
                        </select>
                    </div>
                </div>
            </div>
            <table className="table">
                <thead className="custom-header">
                    <tr>
                        <th>Country Name</th>
                        <th>Region</th>
                        <th>Population</th>
                        <th>Area</th>
                        <th>Flag</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((country) => (
                        <tr key={country.name}>
                            <td>{country.name}</td>
                            <td>{country.region}</td>
                            <td>{country.population}</td>
                            <td>{country.area}</td>
                            <td>
                                <img src={country.flags.png} alt={`${country.name} Flag`} width="50" height="30" />
                            </td>
                            <td>
                                <div className="horizontal-line"></div>

                                <span
                                    onClick={() => handleRemoveCountry(country.name)}
                                    className="bi bi-x-circle  fs-3 pointer"
                                >

                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination-container">
                {renderPagination()}
            </div>
        </div>
    );
};

export default CountryTable;

