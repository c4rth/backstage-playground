import { HeaderLabel, Link } from '@backstage/core-components';
import { Entity } from '@backstage/catalog-model';
import { ComponentDisplayName } from '.';

// TODO-MUI
import { makeStyles } from '@material-ui/core';

type EntityLabelsProps = {
    entity: Entity;
};

const useStyles = makeStyles(
  theme => ({
    label: {
      color: theme.page.fontColor,
    },
  }),
  { name: 'BackstageHeaderLabel' },
);

export function ComponentHeaderLabels(props: EntityLabelsProps) {
    const { entity } = props;
    const classes = useStyles();
    const system = entity.spec?.system?.toString();
    return (
        <>
            {system && (
                <HeaderLabel
                    label='Owner'
                    contentTypograpyRootComponent="p"
                    value={
                        <Link to={`/api-platform/system/${system}`}>
                            <div className={classes.label}>
                                <ComponentDisplayName text={system} type="system" />
                            </div>
                        </Link>
                    }
                />
            )}
        </>
    );
}