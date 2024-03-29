<?php

namespace Octave\CMSBundle\Form\Type;

use Octave\CMSBundle\Entity\BlockEntityInterface;
use Octave\CMSBundle\Form\DataTransformer\SimpleFieldDataTransformer;
use Octave\CMSBundle\Page\Block\BlockInterface;
use Octave\CMSBundle\Service\BlockManager;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

class BlocksType extends AbstractType
{
    /** @var BlockManager */
    private $blockManager;

    /** @var $locales */
    private $locales;

    /**
     * BlocksType constructor.
     * @param BlockManager $blockManager
     * @param $locales
     */
    public function __construct(BlockManager $blockManager, $locales)
    {
        $this->blockManager = $blockManager;
        $this->locales = $locales;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $blockTypes = $this->getBlocks($options['block_types']);

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
             * @var string $blockName
             * @var BlockInterface $typeData
             */
            foreach ($blockTypes as $blockName => $typeData) {

                $prototypeOptions = [];
                $prototypeOptions['content_type'] = $typeData->getFormType();
                $prototypeOptions['block_type'] = $typeData->getName();
                $prototypeOptions['locales'] = $options['locales'];
                $prototypeOptions['use_translation'] = $options['use_translation'];

                $prototypeOptions = array_merge($prototypeOptions, $typeData->getOptions());

                $prototype = $builder->create($options['prototype_name'], $options['entry_type'], $prototypeOptions);
                $blockPrototypes[$blockName] = $prototype->getForm();
            }

            $builder->setAttribute('block_prototypes', $blockPrototypes);
        }

        $prepareFormFunction = function (FormEvent $event) use ($blockTypes, $options) {

            $data = $event->getData();
            $form = $event->getForm();

            if (null === $data) {
                $data = array();
            }

            foreach ($data as $name => $value) {

                $childOptions = $form->get($name)->getConfig()->getOptions();
                $type = ($value instanceof BlockEntityInterface) ? $value->getType() : $value['type'];

                /** @var BlockInterface $block */
                $block = $blockTypes[$type];

                $childOptions['block_type'] = $type;
                $childOptions['content_type'] = $block->getFormType();
                $childOptions['locales'] = $options['locales'];
                $childOptions['use_translation'] = $options['use_translation'];

                $childOptions = array_merge($childOptions, $block->getOptions());

                $form->remove($name);
                $form->add($name, BlockItemType::class, $childOptions);
            }
        };

        $builder->addEventListener(FormEvents::PRE_SET_DATA, $prepareFormFunction);
        $builder->addEventListener(FormEvents::PRE_SUBMIT, $prepareFormFunction);

        if ($options['serializing']) {
            $builder->addModelTransformer(new SimpleFieldDataTransformer());
        }

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

        $view->vars['block_types'] = $this->getBlocks($options['block_types']);
    }

    /**
     * @param array $blocks
     * @return array
     */
    private function getBlocks(array $blocks)
    {
        $blockList = $this->blockManager->getBlocks();

        if (count($blocks) === 0) {
            return $blockList;
        }

        $blockTypes = array_filter($blockList, function ($k) use ($blocks) {
            if (in_array($k, $blocks)) {
                return true;
            }

            return false;
        }, ARRAY_FILTER_USE_KEY);

        if (count($blockTypes) === 0) {
            return $blockList;
        }

        return $blockTypes;
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'block_types' => [],
            'locales' => $this->locales,
            'serializing' => false,
            'use_translation' => true,
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