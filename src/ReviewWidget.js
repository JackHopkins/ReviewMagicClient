import React, { useState, useCallback, useRef, useEffect } from 'react'
import debounce from "lodash.debounce";

import { makeStyles, withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';
import logo from './logo.png'
import {readString} from "react-papaparse";
import List from '@material-ui/core/List';
import Paper from '@material-ui/core/Paper';
import Slider from '@material-ui/core/Slider';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';

const styles = (theme) => ({
  root: {
    minHeight: 500,
    width: 360,
    backgroundColor: theme.palette.background.paper,
    margin: theme.spacing(10, 0)
  },
  textbox: {
    width: '95%',
    margin: '0 2.5%',
    backgroundColor: theme.palette.background.paper,
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  section1: {
    margin: theme.spacing(3, 2),
    minHeight: '175px'
  },
  section2: {
    margin: theme.spacing(2),
  },
  section3: {
    margin: theme.spacing(3, 1, 1),
  },
  submit: {
    width: '100%',
  },
  skeleton: {
    margin: '5px 0'
  }
});



class ReviewWidget extends React.Component {


  constructor(props) {
    super(props)

    this.state = {
      selectedPurchase: new Set(),
      selectedService: new Set(),
      previousReviews: [],
      serviceTags: ["Good", "Reliable", "Friendly", "Poor", "Effortless", "Annoying", "Happy", "Great"],
      purchaseTags: ["Sturdy", "Fast delivery", "Expensive", "Recommend", "Quality", "Expected"],
      debouncedSave: debounce(nextValue => this.getReview(props), 300)
    };


  }
  componentDidMount () {
    this.getProduct().then(data => this.setState({product: data}));
  }

  async getReview(props) {
    console.info("Getting review.")

    if (this.state.review) {
      let reviewObj = {review: this.state.review, summary: this.state.summary}
      console.log("Checking previous reviews.")
      if (!new Set(this.state.previousReviews).has(reviewObj)) {
        this.state.previousReviews.push(reviewObj)
        console.log("Adding previous review.")
      }
    }

    let tag_array = Array.from(new Set([...this.state.selectedService, ...this.state.selectedPurchase]))
    let tag_string = tag_array.join([", "]).toLowerCase()
    this.state.tags = tag_array

    let product = await this.state.product
    let location = props.address

    const search = window.location.search;
    const params = new URLSearchParams(search);
    let temperature = params.get('temperature');
    if (temperature == null) {
      temperature = 1.0
    }

    let payload = {
      "tags" : tag_string,
      "product" : product
    }

    // POST request using fetch with async/await
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    };
    this.setState({ awaiting: true });
    const response = await fetch(location+'/review-generator?temperature='+temperature, requestOptions);
    const data = await response.json();
    this.setState({ awaiting: false });
    const review = data.review.slice(1).replace("</s>", ".");
    const summary = data.summary.slice(1);
    this.setState({ review: review, summary: summary});
  }

  handleClick = (chip, selectedState) => {
    let selected = selectedState;
    if (!selected.has(chip)) {
      selected.add(chip)
    }else{
      selected.delete(chip)
    }
    this.state.debouncedSave(chip);
    return selected;
  }

  handlePurchaseClick = (chip, event) => {
    this.setState({
      selectedPurchase: this.handleClick(chip, this.state.selectedPurchase)
    });
    console.info(this.state.selectedPurchase);
  };
  handleServiceClick = (chip, event) => {
    this.setState({
      selectedService: this.handleClick(chip, this.state.selectedService)
    });
    console.info(this.state.selectedService);
  };

  getProduct = () => {
    return fetch(process.env.PUBLIC_URL+'/products.csv')
      .then((r) => r.text())
      .then(text  => {
        let products = readString(text).data;
        return products[Math.floor(Math.random()*products.length)]
      })
      .then(function (product_array) {
        return {
        //.replace(/[^\w\s]/gi, '')
          blurb: product_array[4].replace(/(<([^>]+)>)/gi, ""),
          price: "£"+product_array[5].slice(0, -6),
          title: product_array[1],
          brand: product_array[6]
        }
      })
  }
  TemperatureSlider = (classes) => {
    let valuetext = 50
    return (
      <div className={classes.temperature}>
        <Typography id="discrete-slider" gutterBottom>
          Temperature
        </Typography>
        <Slider
          defaultValue={30}
          getAriaValueText={valuetext}
          aria-labelledby="discrete-slider"
          valueLabelDisplay="auto"
          step={10}
          marks
          min={10}
          max={110}
        />
      </div>)
  }

  ProductDetails = () => {
    const product = this.state.product;

    return product && <div>
      <Grid container alignItems="center">
        <Grid item xs>
          <Typography gutterBottom variant="h6">
            {product.title}
          </Typography>
        </Grid>
        <Grid item>
          <Typography gutterBottom variant="h6">
            {product.price}
          </Typography>
        </Grid>
      </Grid>
      <Typography color="textSecondary" variant="body2">
        {product.blurb}
      </Typography>
    </div>
  }

  ReviewSection = (classes) => {
    if (this.state.awaiting) {
    return <React.Fragment>
              <Skeleton className={classes.skeleton} variant="rect" height={48}/>

              <Skeleton className={classes.skeleton} variant="rect" height={143} />

           </React.Fragment>
    }
    let review = this.state.review
    let summary = this.state.summary
    return review && <form noValidate autoComplete="off">
                        <TextField className={classes.textbox}
                          id="standard-read-only-input"
                          label="Summary" value={summary}/>
                        <TextField className={classes.textbox}
                                   id="filled-basic"
                                   label="Review"
                                   multiline
                                   rows={6}
                                   value={review}/>
                      </form>

  }
  TagSection = (classes) => {
    return <React.Fragment>
      <div className={classes.section2}>
     <Typography gutterBottom variant="body1">
      How was your purchase?
      </Typography>
        <div>
      {this.state.purchaseTags.map((tag, index) => (
        <Chip className={classes.chip}
        color={this.state.selectedPurchase.has(tag) ? "primary" : "default"}
        onClick={(e) => this.handlePurchaseClick(tag, e)} label={tag}/>
        ))}
        </div>
      </div>
      <Divider variant="middle"/>
      <div className={classes.section2}>
      <Typography gutterBottom variant="body1">
      How would you describe the experience?
      </Typography>
      <div>
      {this.state.serviceTags.map((tag, index) => (
      <Chip className={classes.chip}
      color={this.state.selectedService.has(tag) ? "primary" : "default"}
      onClick={(e) => this.handleServiceClick(tag, e)} label={tag}/>
      ))}
      </div>
      </div>
    </React.Fragment>
  }

  PreviousReviews = (classes) => {

    const handleListItemClick = (event, index, reviewObj) => {
      this.setState({
        selectedIndex: index,
        review: reviewObj.review,
        summary: reviewObj.summary,
        awaiting: false
      })
    };

    return <div className={classes.section1}>
      <List dense className={classes.root} subheader={
      <ListSubheader component="div" id="nested-list-subheader">
        Previous Review
      </ListSubheader>
    }>
        <Divider variant="middle" component="li" />
      {this.state.previousReviews.map((reviewObj, index) => (
        <React.Fragment>
          <ListItem
            button
            alignItems="flex-start"
            selected={this.state.selectedIndex === index}
            onClick={(event) => handleListItemClick(event, index, reviewObj)}>
            <ListItemText
              primary= {reviewObj.summary}

              secondary={
                <React.Fragment>
                  <Typography
                    component="span"
                    variant="body2"
                    className={classes.inline}
                    color="textPrimary"
                  />
                  {reviewObj.review}
                </React.Fragment>
              }
            />
          </ListItem>
          {index != this.state.previousReviews.length-1 &&
            <Divider variant="middle" component="li" />}
        </React.Fragment>
      ))
      }

    </List>
    </div>
  }

  render() {
    //const classes = styles();
    const { classes } = this.props;
    return (
      <Grid container
            direction="row"
            justify="space-evenly"
            alignItems="flex-start"
            spacing={4}>

      <Grid key={0}>
        <Paper className={classes.root}>
        <div className={classes.section1}>
        {this.ProductDetails()}
        </div>
        <Divider variant="middle"/>
          {this.TagSection(classes)}

        {this.state.selectedPurchase.size + this.state.selectedService.size > 0 &&
          <React.Fragment>
            <Divider variant="middle"/>
            <div>
              <div className={classes.section3}>
                {this.ReviewSection(classes)}
              </div>
              <div className={classes.section4}>
                <Button size="large" justify="center" className={classes.submit} color="primary">Accept & Submit</Button>
              </div>
            </div>
          </React.Fragment>
        }
      </Paper>
      </Grid>
        <Grid key={1} >
          <Paper className={classes.root}>
      {this.PreviousReviews(classes)}
          </Paper>
        </Grid>
      </Grid>

    );
  }


}
export default withRouter(connect()(withStyles(styles)(ReviewWidget)));
