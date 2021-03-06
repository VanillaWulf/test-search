//ходит на сервер, забирает данные
import React from 'react';
import './AutocompleteModRouting.css';
import Autosuggest from 'react-autosuggest';
import GetKladr from '../../util/GetKladr.js';


function getSuggestionValue(suggestion) {
    return suggestion.City;
};

function renderSuggestion(suggestion) {
    return ( <div>
              <span>{suggestion.City}</span>
            </div>
          );
};

class AutocompleteModRouting extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: '',
            suggestions: [],
            results:[],
            noSuggestions: true, //тригерит наличие совпадений (нужен для рендеринга состояния загрузки)
            isLoading: false,
            message: '',
            isServerError: false,
            noMatches: false, //нужен для рендеринга ошибки без совпадений
            isValidate: true,
            validationData: [],
            isChoosen: true,
            inputClassName: 'react-autosuggest__input'
        };

        this.lastRequestId = null;
        this.getSuggestions = this.getSuggestions.bind(this);
        this.renderSuggestionsContainer = this.renderSuggestionsContainer.bind(this);
        this.refreshState = this.refreshState.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.getKeyArray = this.getKeyArray.bind(this);
        this.inputOnFocus = this.inputOnFocus.bind(this);

    };


    loadSuggestions(value) {

        this.setState(() => ({
            noSuggestions: true,
            isValidate: true,
            inputClassName: 'react-autosuggest__input',
            results: []
        }));

        GetKladr.getKladrArray(value).then(results =>this.setState({results}));
        //обрабатывает только валидный

        console.log(this.state.results);

        setTimeout(() => {
            console.log('start loading');
            if (this.state.noSuggestions) {
                this.setState(() => ({
                    isLoading: true,
                    isServerError: false,
                    suggestions: [{}]
                }));
            };
        }, 500);

        setTimeout(() => {
          if(this.state.results.length===0){
           console.log('render error');
            this.setState(() => ({
              isLoading: false,
              isServerError: true,
              suggestions: [{}]
            }));
            return;
          }else{
            this.setState(() => ({
              isLoading: false,
              suggestions: this.getSuggestions()
             }))
          };
        }, 1500);

    }

    getSuggestions() {
      /*  const {
            value,
        } = this.state;*/

        let searchResult = this.state.results;

        if (searchResult.length > 5) {
            this.setState(() => ({
                noSuggestions: false,
                noMatches: false,
                message: `Показано 5 из ${searchResult.length-5} найденных городов. Уточните запрос, чтобы увидеть остальные`,
                validationData: this.getKeyArray(searchResult, "City")
            }));
            return searchResult.splice(0, 5);
        } else if (searchResult.length === 0) {
            this.setState(() => ({
                noSuggestions: true,
                noMatches: true
            }));
            return [{
                Id: '',
                City: ''
            }];
        } else if (searchResult.length !== 0 && searchResult.length < 5) {
            this.setState(() => ({
                noSuggestions: false,
                noMatches: false,
                message: '',
                validationData: searchResult
            }));
            return searchResult;
        };
    };

    onChange = (event, {newValue,method}) => {
        this.setState(() => ({
            value: newValue,
            noSuggestions: true
        }));
    };

    onBlur() {
        console.log('lost focus');
        /* для валидации c lowerCase
        let lowerCaseData = this.state.validationData.map(item=>item.toLowerCase());

        if(lowerCaseData.indexOf(this.state.value.toLowerCase())===-1){
          console.log('render the onBlur error');
          this.setState(()=>({
            isValidate: false
          }));
        }*/
        if (this.state.isLoading || this.state.noMatches || this.state.isServerError || !this.state.value) {
            console.log('not choosen');
            this.setState(() => ({
                isChoosen: false,
                isValidate: true,
                inputClassName: 'react-autosuggest__input react-autosuggest__input--validation-error'
            }))
        } else if (this.state.validationData.indexOf(this.state.value) === -1) {
            console.log('choosen, not validated');
            this.setState(() => ({
                isValidate: false,
                isChoosen: true,
                inputClassName: 'react-autosuggest__input react-autosuggest__input--validation-error'
            }));
        }else{
          this.setState(() => ({
              isValidate: true,
              isChoosen: true
          }));
        }
    }

    inputOnFocus() {
        this.setState(() => ({
            isValidate: true,
            inputClassName: 'react-autosuggest__input'
        }));
    }

    getKeyArray(objectsArray, keyName) {
        let resultArray = [];
        for (let i = 0; i < objectsArray.length; i++) {
            let newObject = objectsArray[i];
            for (let key in newObject) {
                if (key === keyName) {
                    resultArray.push(newObject[key]);
                };
            };
        };
        return resultArray;
    };

    refreshState() {
        console.log('refresh state');
        this.loadSuggestions();
    };

    onSuggestionsFetchRequested = ({
        value
    }) => {
        this.loadSuggestions(value);
    };

    onSuggestionsClearRequested = () => {
        this.setState(() => ({
            suggestions: [],
            isServerError: false
        }));
    };

    //кастомизация контейнера
    renderSuggestionsContainer({
        containerProps,
        children
    }) {
        if (this.state.isLoading) {
            return (
              <div { ...containerProps} >
                <div className = "footer react-autosuggest__advice react-autosuggest__advice--loader" >
                  Загрузка
                </div>
              </div>
            );
        } else if (this.state.isServerError) {
            return (
              <div { ...containerProps}>
                <div className = "footer react-autosuggest__advice react-autosuggest__advice--server-error" >
                  Что - то пошло не так. Проверьте соединение с интернетом и попробуйте еще раз < br / >
                  <button className = "react-autosuggest__advice__refresh-button" onClick = {this.refreshState}>Обновить</button>
                </div>
              </div>
            ); //todo: onpressKey = enter
        } else if (this.state.noMatches) {
            return (
              <div { ...containerProps} >
                <div className = "footer react-autosuggest__advice">
                  Не найдено
                </div>
              </div>
            );
        } else {
            return (
              <div { ...containerProps}>
                { children}
                {
                  <div className = "footer react-autosuggest__advice react-autosuggest__advice--small" >
                    {this.state.message}
                  </div>
                }
              </div>
            );
        }
    };

    render() {
        const {
            value,
            suggestions,
            isValidate,
            isChoosen
        } = this.state;
        const inputProps = {
            placeholder: "Начните вводить код или название",
            value,
            onChange: this.onChange,
            onBlur: this.onBlur,
            className: this.state.inputClassName,
            onFocus: this.inputOnFocus
        };

        return (
          <div className = 'react-autosuggest' >
            <Autosuggest
              suggestions = {suggestions}
              onSuggestionsFetchRequested = {this.onSuggestionsFetchRequested}
              onSuggestionsClearRequested = {this.onSuggestionsClearRequested}
              getSuggestionValue = {getSuggestionValue}
              renderSuggestion = {renderSuggestion}
              inputProps = {inputProps}
              renderSuggestionsContainer = {this.renderSuggestionsContainer}
              highlightFirstSuggestion = {true}
            />
            {
                !isValidate &&
                    <div className = "react-autosuggest__advice__validation" >
                      Добавьте значение в справочник или выберите другое значение из списка
                    </div>
            }
            {
                !isChoosen &&
                    <div className = "react-autosuggest__advice__validation" >
                      Выберите значение из списка
                    </div>
            }
          </div>
        );
    }
}
export default AutocompleteModRouting;
