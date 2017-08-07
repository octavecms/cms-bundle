<?php

namespace VideInfra\CMSBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;
use VideInfra\CMSBundle\Page\Block\BlockInterface;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class BlockCollectionType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $blockTypes = $options['block_types'];

        if ($options['allow_add'] && $options['prototype']) {

            $prototypeOptions = array_replace(array(
                'required' => $options['required'],
                'label' => $options['prototype_name'].'label__',
            ), $options['entry_options']);

            if (null !== $options['prototype_data']) {
                $prototypeOptions['data'] = $options['prototype_data'];
            }

            $blockPrototypes = [];
            /**
             * @var string $blockType
             * @var BlockInterface $typeData
             */
            foreach ($blockTypes as $blockType => $typeData) {

                $prototypeOptions['content_type'] = $blockType;
                $prototypeOptions['block_type'] = $typeData->getName();

                $prototype = $builder->create($options['prototype_name'], $options['entry_type'], $prototypeOptions);
                $blockPrototypes[$blockType] = $prototype->getForm();
            }

            $builder->setAttribute('block_prototypes', $blockPrototypes);
        }

        $builder->addEventListener(FormEvents::PRE_SET_DATA, function (FormEvent $event) use ($blockTypes) {

            $data = $event->getData();
            $form = $event->getForm();

            if (null === $data) {
                $data = array();
            }

            foreach ($data as $name => $value) {

                $options = $form->get($name)->getConfig()->getOptions();
                $type = $value->getType();
                $options['block_type'] = $type;

                /**
                 * @var string $blockType
                 * @var BlockInterface $blockData
                 */
                foreach ($blockTypes as $blockType => $blockData) {
                    if ($blockData->getName() == $type) {
                        $options['content_type'] = $blockType;
                        break;
                    }
                }

                $form->remove($name);
                $form->add($name, BlockItemType::class, $options);
            }
        });

    }

    /**
     * @param FormView $view
     * @param FormInterface $form
     * @param array $options
     */
    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        if ($form->getConfig()->hasAttribute('block_prototypes')) {
            $prototypes = $form->getConfig()->getAttribute('block_prototypes');

            /** @var FormInterface $prototype */
            foreach ($prototypes as $blockType => $prototype) {
                $view->vars['block_prototypes'][$blockType] = $prototype->setParent($form)->createView($view);
            }
        }

        $view->vars['block_types'] = $options['block_types'];
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'block_types' => []
        ));
    }

    /**
     * @return string
     */
    public function getParent()
    {
        return CollectionType::class;
    }
}