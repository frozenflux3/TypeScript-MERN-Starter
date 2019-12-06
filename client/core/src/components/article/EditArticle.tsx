import React from "react";
import connectPropsAndActions from "../../shared/connect";
import AppState from "../../models/client/AppState";
import { Redirect, match } from "react-router-dom";
import ArticleActionCreator from "../../models/client/ArticleActionCreator";
import Article from "../../models/Article";
import ErrorPage from "../../pages/ErrorPage";
import { Container, Header } from "semantic-ui-react";
import { CONTAINER_STYLE } from "../../shared/styles";
import ArticleEditor from "./ArticleEditor";
import { ModalButtonProps } from "../shared/WarningModal";
import { injectIntl, WrappedComponentProps as IntlProps, MessageDescriptor, FormattedMessage } from "react-intl";
import { PrimitiveType } from "intl-messageformat";
import { MOBILE_DESKTOP_BOUND } from "../constants";

interface Props extends IntlProps {
    match: match<any>;
    state: AppState;
    actions: ArticleActionCreator;
}

interface States {}
class EditArticle extends React.Component<Props, States> {
    private articleId: string = "";
    render(): React.ReactElement<any> {
        const message: (descriptor: MessageDescriptor, values?: Record<string, PrimitiveType>) => string = this.props.intl.formatMessage;
        if (!this.props.state.articleState.valid) {
            return <Redirect to="/" />;
        }
        const notFoundError: Error = {
            name: "404 Not Found",
            message: `not found for ${window.location.href} `
        };
        this.articleId = this.props.match && this.props.match.params && this.props.match.params.articleId;
        if (!this.articleId) {
            return <ErrorPage error={notFoundError} />;
        }
        const article: Article | undefined = this.props.state.articleState.data.find(
            (value: Article): boolean => value._id === this.articleId
        );
        if (!article) {
            return <ErrorPage error={notFoundError} />;
        }
        if (this.props.state.userState.currentUser) {
            const containerStyle: any = (window as any).visualViewport.width > MOBILE_DESKTOP_BOUND ?
                {...CONTAINER_STYLE, paddingLeft: 20, paddingRight: 20} : CONTAINER_STYLE;
            return (
                <Container style={containerStyle}>
                    <Header size={"medium"}>
                        <FormattedMessage id="page.article.edit" />
                    </Header>
                    <ArticleEditor article={article} submitTextId="component.button.update" onSubmit={this.editArticle} loading={this.props.state.articleState.loading}
                        negativeButtonProps={{
                            descriptionIcon: "delete",
                            descriptionText: message({id: "page.article.delete"}, {title: article.title}),
                            warningText: message({id: "page.article.delete_confirmation"}),
                            onConfirm: this.removeArticle
                        } as ModalButtonProps}/>
                </Container>
            );
        } else {
            return <Redirect to="/" />;
        }
    }

    private editArticle = (title: string, content: string): void => {
        if (this.props.state.userState.currentUser) {
            this.props.actions.editArticle({
                author: this.props.state.userState.currentUser._id,
                title: title,
                content: content,
                _id: this.articleId
            } as Article);
        }
    }

    private removeArticle = (): void => {
        this.props.actions.removeArticle(this.articleId);
    }
}

export default injectIntl(connectPropsAndActions(EditArticle));