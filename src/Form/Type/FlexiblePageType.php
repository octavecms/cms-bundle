<?php

namespace Octave\CMSBundle\Form\Type;

use A2lix\TranslationFormBundle\Form\Type\TranslationsType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Octave\CMSBundle\Entity\Page;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class FlexiblePageType extends AbstractType
{
    /** @var $locales */
    private $locales;

    /**
     * FlexiblePageType constructor.
     * @param $locales
     */
    public function __construct($locales = [])
    {
        $this->locales = $locales;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $isAdmin = $options['is_admin'];

        if ($isAdmin) {
            $builder
                ->add('name', TextType::class);
        }

        $builder
            ->add('active', CheckboxType::class, [
                'required' => false
            ])
            ->add('includeInMenu', CheckboxType::class, [
                'required' => false
            ])
            ->add('includeInSitemap', CheckboxType::class, [
                'required' => false
            ])
            ->add('path', TextType::class)
            ->add('baseTemplate', TextType::class, [
                'required' => false
            ])
            ->add('blocks', BlockCollectionType::class, [
                'entry_type' => BlockItemType::class,
                'entry_options' => [
                    'locales' => $options['locales']
                ],
                'allow_add' => true,
                'allow_delete' => true,
                'block_types' => $options['block_types'],
                'locales' => $options['locales']
            ])
        ;

        $builder
            ->add('translations', TranslationsType::class, [
                'label' => false,
                'locales' => $options['locales'],
                'fields' => [
                    'title' => [
                        'required' => true,
                        'field_type' => TextType::class,
                    ],
                    'metaTitle' => [
                        'field_type' => TextType::class,
                        'required' => false
                    ],
                    'metaKeywords' => [
                        'field_type' => TextareaType::class,
                        'required' => false
                    ],
                    'metaDescription' => [
                        'field_type' => TextareaType::class,
                        'required' => false
                    ]
                ]
            ]);
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => Page::class,
            'is_admin' => false,
            'locales' => $this->locales,
            'block_types' => []
        ));
    }
}